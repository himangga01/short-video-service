const assert = require('node:assert/strict');
const fs = require('fs/promises');
const http = require('http');
const os = require('os');
const path = require('path');
const test = require('node:test');
const sharp = require('sharp');

function wait(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

function createDeferred() {
  let resolve;
  let reject;
  const promise = new Promise((promiseResolve, promiseReject) => {
    resolve = promiseResolve;
    reject = promiseReject;
  });

  return { promise, reject, resolve };
}

async function readRequestBody(req) {
  const chunks = [];
  for await (const chunk of req) {
    chunks.push(chunk);
  }
  return Buffer.concat(chunks).toString('utf8');
}

function createFakeGeminiServer() {
  let mode = 'success';
  let releaseHold = null;
  let requestSeen = createDeferred();

  const pcmBuffer = Buffer.alloc(24000 * 2);
  const server = http.createServer(async (req, res) => {
    if (!req.url.includes(':generateContent')) {
      res.writeHead(404).end();
      return;
    }

    const body = await readRequestBody(req);
    requestSeen.resolve({ body, headers: req.headers, url: req.url });

    if (mode === 'hold') {
      await new Promise((resolve) => {
        releaseHold = resolve;
      });
    }

    if (mode === 'timeout') {
      await wait(500);
    }

    if (res.destroyed || res.writableEnded) {
      return;
    }

    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(
      JSON.stringify({
        candidates: [
          {
            content: {
              parts: [
                {
                  inlineData: {
                    mimeType: 'audio/L16;rate=24000',
                    data: pcmBuffer.toString('base64'),
                  },
                },
              ],
            },
          },
        ],
      })
    );
  });

  return {
    server,
    release() {
      if (releaseHold) {
        releaseHold();
        releaseHold = null;
      }
    },
    reset(nextMode) {
      mode = nextMode;
      releaseHold = null;
      requestSeen = createDeferred();
    },
    waitForRequest(timeoutMs = 3000) {
      return Promise.race([
        requestSeen.promise,
        wait(timeoutMs).then(() => {
          throw new Error('Fake Gemini server was not called in time.');
        }),
      ]);
    },
  };
}

let appServer;
let baseUrl;
let db;
let fakeGemini;
let localPathFromUploadUrl;
let testRoot;
const createdProjectIds = new Set();

async function jsonRequest(method, pathname, body) {
  const response = await fetch(`${baseUrl}${pathname}`, {
    method,
    headers: body ? { 'Content-Type': 'application/json' } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await response.json().catch(() => ({}));
  return { data, response };
}

async function createProjectAndPanel(script = 'Regression test scene') {
  const projectResult = await jsonRequest('POST', '/api/projects', {
    title: `regression-${Date.now()}-${Math.random().toString(16).slice(2)}`,
  });
  assert.equal(projectResult.response.status, 201);
  createdProjectIds.add(projectResult.data.id);

  const panelResult = await jsonRequest('POST', '/api/panels', {
    project_id: projectResult.data.id,
    script,
    voice_id: 'Kore',
  });
  assert.equal(panelResult.response.status, 201);

  return {
    panel: panelResult.data,
    project: projectResult.data,
  };
}

async function cleanupProjects() {
  for (const projectId of [...createdProjectIds]) {
    await jsonRequest('DELETE', `/api/projects/${projectId}`).catch(() => {});
    createdProjectIds.delete(projectId);
  }
}

test.before(async () => {
  testRoot = await fs.mkdtemp(path.join(os.tmpdir(), 'ssul-maker-test-'));
  fakeGemini = createFakeGeminiServer();
  await new Promise((resolve) => {
    fakeGemini.server.listen(0, '127.0.0.1', resolve);
  });

  process.env.DATABASE_PATH = path.join(testRoot, 'ssulmaker-test.db');
  process.env.GEMINI_API_BASE_URL = `http://127.0.0.1:${fakeGemini.server.address().port}`;
  process.env.GEMINI_API_KEY = 'test-gemini-key';
  process.env.GEMINI_TTS_MODEL = 'gemini-2.5-flash-preview-tts';
  process.env.GEMINI_TTS_TIMEOUT_MS = '100';
  process.env.UPLOAD_DIR = path.join(testRoot, 'uploads');

  const app = require('../src/app');
  db = require('../src/db');
  ({ localPathFromUploadUrl } = require('../src/paths'));

  await db.migrate.latest({ directory: path.resolve(__dirname, '../migrations') });

  appServer = app.startServer(0);
  if (!appServer.listening) {
    await new Promise((resolve) => appServer.once('listening', resolve));
  }
  baseUrl = `http://127.0.0.1:${appServer.address().port}`;
});

test.afterEach(async () => {
  await cleanupProjects();
});

test.after(async () => {
  await cleanupProjects();

  if (appServer) {
    await new Promise((resolve) => appServer.close(resolve));
  }

  if (fakeGemini?.server) {
    fakeGemini.server.closeAllConnections?.();
    await new Promise((resolve) => fakeGemini.server.close(resolve));
  }

  if (db) {
    await db.destroy();
  }

  if (testRoot) {
    await fs.rm(testRoot, { force: true, recursive: true });
  }
});

test('panel update rejects invalid settings and image upload succeeds', async () => {
  const { panel } = await createProjectAndPanel('Image upload regression scene');

  const invalidUpdate = await jsonRequest('PUT', `/api/panels/${panel.id}`, {
    text_size: 'abc',
  });
  assert.equal(invalidUpdate.response.status, 400);

  const pngBuffer = await sharp({
    create: {
      width: 16,
      height: 16,
      channels: 3,
      background: '#ffffff',
    },
  })
    .png()
    .toBuffer();
  const form = new FormData();
  form.append('image', new Blob([pngBuffer], { type: 'image/png' }), 'smoke.png');

  const uploadResponse = await fetch(`${baseUrl}/api/panels/${panel.id}/image`, {
    method: 'POST',
    body: form,
  });
  const uploadData = await uploadResponse.json();
  assert.equal(uploadResponse.status, 200);
  assert.equal(uploadData.image_status, 'ready');
  assert.ok(uploadData.image_url);

  const imagePath = localPathFromUploadUrl(uploadData.image_url);
  assert.ok(imagePath);
  await assert.doesNotReject(() => fs.access(imagePath));
});

test('stale in-flight TTS does not overwrite a changed script', async () => {
  fakeGemini.reset('hold');
  const { panel } = await createProjectAndPanel('First script for stale TTS.');

  const ttsPromise = jsonRequest('POST', `/api/panels/${panel.id}/tts`, {
    instructions: 'Read calmly.',
  });
  await fakeGemini.waitForRequest();

  const updatedScript = 'Second script. The previous TTS must stay invalid.';
  const updateResult = await jsonRequest('PUT', `/api/panels/${panel.id}`, {
    script: updatedScript,
  });
  assert.equal(updateResult.response.status, 200);

  fakeGemini.release();
  const staleResult = await ttsPromise;
  assert.equal(staleResult.response.status, 200);

  const storedPanel = await db('panels').where('id', panel.id).first();
  assert.equal(storedPanel.script, updatedScript);
  assert.equal(storedPanel.tts_status, 'idle');
  assert.equal(storedPanel.audio_url, null);
  assert.equal(storedPanel.tts_hash, null);
});

test('Gemini timeout marks the panel TTS as failed', async () => {
  fakeGemini.reset('timeout');
  const { panel } = await createProjectAndPanel('Timeout regression scene.');

  const ttsResult = await jsonRequest('POST', `/api/panels/${panel.id}/tts`, {});
  assert.equal(ttsResult.response.status, 504);

  const storedPanel = await db('panels').where('id', panel.id).first();
  assert.equal(storedPanel.tts_status, 'failed');
  assert.match(storedPanel.tts_error, /Gemini TTS/);
});
