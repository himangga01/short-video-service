const { spawn } = require('child_process');
const crypto = require('crypto');
const fs = require('fs/promises');
const path = require('path');
const ffmpegPath = require('ffmpeg-static');
const db = require('../db');
const {
  audioUploadDir,
  localPathFromUploadUrl,
  uploadUrlFor,
} = require('../paths');

const FALLBACK_TTS_MODEL = 'gemini-2.5-flash-preview-tts';
const DEFAULT_TTS_INSTRUCTIONS =
  process.env.TTS_DEFAULT_INSTRUCTIONS ||
  '한국어 썰 영상 내레이션처럼 자연스럽고 몰입감 있게 읽어주세요. 문장 사이에는 적당한 호흡을 둡니다.';
const DEFAULT_TTS_VOICE = process.env.TTS_DEFAULT_VOICE || 'Kore';
const GEMINI_API_BASE_URL =
  process.env.GEMINI_API_BASE_URL || 'https://generativelanguage.googleapis.com/v1beta';
const GEMINI_TTS_TIMEOUT_MS = Number(process.env.GEMINI_TTS_TIMEOUT_MS || 60000);
const MAX_TTS_INPUT_LENGTH = 4096;
const SUPPORTED_TTS_VOICES = [
  'Zephyr',
  'Puck',
  'Charon',
  'Kore',
  'Fenrir',
  'Leda',
  'Orus',
  'Aoede',
  'Callirrhoe',
  'Autonoe',
  'Enceladus',
  'Iapetus',
  'Umbriel',
  'Algieba',
  'Despina',
  'Erinome',
  'Algenib',
  'Rasalgethi',
  'Laomedeia',
  'Achernar',
  'Alnilam',
  'Schedar',
  'Gacrux',
  'Pulcherrima',
  'Achird',
  'Zubenelgenubi',
  'Vindemiatrix',
  'Sadachbia',
  'Sadaltager',
  'Sulafat',
];
const VOICE_BY_LOWERCASE = new Map(
  SUPPORTED_TTS_VOICES.map((voiceName) => [voiceName.toLowerCase(), voiceName])
);

function resolveDefaultTtsModel() {
  const candidate = process.env.GEMINI_TTS_MODEL || process.env.TTS_MODEL;
  return typeof candidate === 'string' &&
    (candidate.startsWith('gemini-') || candidate.startsWith('models/gemini-'))
    ? candidate
    : FALLBACK_TTS_MODEL;
}

const DEFAULT_TTS_MODEL = resolveDefaultTtsModel();

function createHttpError(message, statusCode) {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
}

function formatPanel(panel) {
  if (!panel) return panel;

  return {
    ...panel,
    render_ready: Boolean(panel.render_ready),
  };
}

function normalizeVoice(voiceId) {
  const requestedVoice = typeof voiceId === 'string' ? voiceId.trim().toLowerCase() : '';
  const defaultVoice = DEFAULT_TTS_VOICE.trim().toLowerCase();

  return (
    VOICE_BY_LOWERCASE.get(requestedVoice) ||
    VOICE_BY_LOWERCASE.get(defaultVoice) ||
    'Kore'
  );
}

function normalizeSpeed(speed) {
  const numericSpeed = Number(speed);
  if (!Number.isFinite(numericSpeed)) return 1;
  return Math.min(Math.max(numericSpeed, 0.25), 4);
}

function createTtsHash({ provider, script, model, voice, speed, instructions }) {
  return crypto
    .createHash('sha256')
    .update(JSON.stringify({ provider, script, model, voice, speed, instructions }))
    .digest('hex');
}

async function fileExists(filePath) {
  if (!filePath) return false;

  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function deleteLocalUpload(url) {
  const localPath = localPathFromUploadUrl(url);
  if (!localPath) return;

  try {
    await fs.unlink(localPath);
  } catch (error) {
    if (error.code !== 'ENOENT') {
      console.warn('업로드 파일 삭제 실패:', error.message);
    }
  }
}

function runFfmpeg(args) {
  return new Promise((resolve, reject) => {
    if (!ffmpegPath) {
      reject(createHttpError('FFmpeg 실행 파일을 찾을 수 없어 TTS 오디오를 변환할 수 없습니다.', 503));
      return;
    }

    const child = spawn(ffmpegPath, args, { windowsHide: true });
    let stderr = '';

    child.stderr.on('data', (chunk) => {
      stderr += chunk.toString();
    });
    child.on('error', reject);
    child.on('close', (code) => {
      if (code === 0) {
        resolve();
        return;
      }

      reject(new Error(`FFmpeg failed with code ${code}: ${stderr.slice(-2000)}`));
    });
  });
}

async function convertPcmToMp3(pcmBuffer, outputPath) {
  const pcmPath = `${outputPath}.${crypto.randomBytes(4).toString('hex')}.pcm`;

  try {
    await fs.writeFile(pcmPath, pcmBuffer);
    await runFfmpeg([
      '-y',
      '-f',
      's16le',
      '-ar',
      '24000',
      '-ac',
      '1',
      '-i',
      pcmPath,
      '-codec:a',
      'libmp3lame',
      '-b:a',
      '128k',
      outputPath,
    ]);
  } finally {
    await fs.rm(pcmPath, { force: true }).catch(() => {});
  }
}

async function getAudioDurationMs(buffer) {
  try {
    const { parseBuffer } = await import('music-metadata');
    const metadata = await parseBuffer(buffer, 'audio/mpeg');
    return metadata.format.duration ? Math.round(metadata.format.duration * 1000) : null;
  } catch (error) {
    console.warn('오디오 길이 분석 실패:', error.message);
    return null;
  }
}

async function refreshPanelRenderReady(panelId) {
  const panel = await db('panels').where('id', panelId).first();
  if (!panel) return null;

  const renderReady = await isPanelRenderReady(panel);
  await db('panels').where('id', panelId).update({ render_ready: renderReady });

  const updatedPanel = await db('panels').where('id', panelId).first();
  return formatPanel(updatedPanel);
}

async function isPanelRenderReady(panel) {
  if (
    !panel.script ||
    !panel.image_url ||
    !panel.audio_url ||
    panel.image_status !== 'ready' ||
    panel.tts_status !== 'completed' ||
    !panel.tts_hash
  ) {
    return false;
  }

  const [hasImageFile, hasAudioFile] = await Promise.all([
    fileExists(localPathFromUploadUrl(panel.image_url)),
    fileExists(localPathFromUploadUrl(panel.audio_url)),
  ]);

  return hasImageFile && hasAudioFile;
}

async function markPanelTtsFailed(panel, errorMessage, extra = {}) {
  await deleteLocalUpload(panel.audio_url);

  await db('panels').where('id', panel.id).update({
    audio_url: null,
    tts_status: 'failed',
    tts_error: errorMessage,
    tts_model: extra.model || panel.tts_model || DEFAULT_TTS_MODEL,
    tts_hash: extra.hash || panel.tts_hash || null,
    tts_instructions: extra.instructions || panel.tts_instructions || DEFAULT_TTS_INSTRUCTIONS,
    audio_duration_ms: null,
    audio_file_size: null,
    render_ready: false,
    updated_at: new Date(),
  });

  await db('projects').where('id', panel.project_id).update({ updated_at: new Date() });
  return refreshPanelRenderReady(panel.id);
}

function describePacing(speed) {
  if (speed <= 0.75) return 'very slow and deliberate';
  if (speed < 0.95) return 'slightly slower than normal';
  if (speed <= 1.05) return 'natural and conversational';
  if (speed < 1.35) return 'slightly faster than normal';
  if (speed < 1.75) return 'fast and energetic';
  return 'very fast, but still clearly articulated';
}

function buildGeminiTtsPrompt({ script, instructions, speed }) {
  return [
    '# AUDIO PROFILE',
    instructions,
    '',
    '# DIRECTOR NOTES',
    `Pacing: ${describePacing(speed)}. Target relative pace: ${speed.toFixed(2)}x.`,
    'Read the transcript exactly as written. Keep Korean narration natural, immersive, and suitable for short-form storytelling videos.',
    'Use natural sentence pauses, but avoid adding new words that are not in the transcript.',
    '',
    '# TRANSCRIPT',
    script,
  ].join('\n');
}

function extractGeminiAudioData(responseBody) {
  const parts = responseBody?.candidates?.[0]?.content?.parts || [];
  const audioPart = parts.find((part) => part.inlineData?.data || part.inline_data?.data);
  const data = audioPart?.inlineData?.data || audioPart?.inline_data?.data;

  return typeof data === 'string' && data ? data : null;
}

function geminiModelPath(model) {
  return model.startsWith('models/') ? model : `models/${model}`;
}

async function fetchWithTimeout(url, options, timeoutMs) {
  const controller = new AbortController();
  const timeout = setTimeout(() => {
    controller.abort();
  }, timeoutMs);

  try {
    return await fetch(url, {
      ...options,
      signal: controller.signal,
    });
  } catch (error) {
    if (error.name === 'AbortError') {
      const timeoutSeconds = Number((timeoutMs / 1000).toFixed(1));
      throw createHttpError(`Gemini TTS 요청이 ${timeoutSeconds}초를 초과했습니다.`, 504);
    }

    throw error;
  } finally {
    clearTimeout(timeout);
  }
}

async function generateGeminiSpeechPcm({ script, model, voice, speed, instructions }) {
  const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;

  if (!apiKey) {
    throw createHttpError('GEMINI_API_KEY가 설정되어 있지 않아 TTS를 생성할 수 없습니다.', 503);
  }

  const response = await fetchWithTimeout(
    `${GEMINI_API_BASE_URL}/${geminiModelPath(model)}:generateContent`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': apiKey,
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: buildGeminiTtsPrompt({ script, instructions, speed }),
              },
            ],
          },
        ],
        generationConfig: {
          responseModalities: ['AUDIO'],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: {
                voiceName: voice,
              },
            },
          },
        },
      }),
    },
    GEMINI_TTS_TIMEOUT_MS
  );

  const responseText = await response.text();
  let responseBody = null;

  try {
    responseBody = responseText ? JSON.parse(responseText) : null;
  } catch {
    responseBody = null;
  }

  if (!response.ok) {
    const message =
      responseBody?.error?.message ||
      responseText ||
      `Gemini TTS 요청에 실패했습니다. status=${response.status}`;
    throw createHttpError(message, response.status >= 500 ? 502 : response.status);
  }

  const audioData = extractGeminiAudioData(responseBody);
  if (!audioData) {
    throw createHttpError('Gemini TTS 응답에 오디오 데이터가 없습니다.', 502);
  }

  return Buffer.from(audioData, 'base64');
}

async function generatePanelTts(panelId, options = {}) {
  const panel = await db('panels').where('id', panelId).first();

  if (!panel) {
    throw createHttpError('패널을 찾을 수 없습니다.', 404);
  }

  const script = typeof panel.script === 'string' ? panel.script.trim() : '';
  if (!script) {
    throw createHttpError('TTS를 생성하려면 대본이 필요합니다.', 400);
  }

  if (script.length > MAX_TTS_INPUT_LENGTH) {
    throw createHttpError(`TTS 입력은 ${MAX_TTS_INPUT_LENGTH}자 이하만 지원합니다.`, 400);
  }

  const model = options.model || DEFAULT_TTS_MODEL;
  const voice = normalizeVoice(options.voice || panel.voice_id);
  const speed = normalizeSpeed(options.speed || panel.voice_speed);
  const instructions =
    typeof options.instructions === 'string' && options.instructions.trim()
      ? options.instructions.trim()
      : panel.tts_instructions || DEFAULT_TTS_INSTRUCTIONS;
  const hash = createTtsHash({
    provider: 'gemini',
    script,
    model,
    voice,
    speed,
    instructions,
  });
  const existingAudioPath = localPathFromUploadUrl(panel.audio_url);

  if (panel.tts_hash === hash && panel.audio_url && (await fileExists(existingAudioPath))) {
    await db('panels').where('id', panel.id).update({
      tts_status: 'completed',
      tts_error: null,
      updated_at: new Date(),
    });

    return refreshPanelRenderReady(panel.id);
  }

  await db('panels').where('id', panel.id).update({
    tts_status: 'processing',
    tts_model: model,
    tts_hash: hash,
    tts_instructions: instructions,
    tts_error: null,
    updated_at: new Date(),
  });

  try {
    await fs.mkdir(audioUploadDir, { recursive: true });

    const filename = `tts-${panel.id}-${hash.slice(0, 12)}.mp3`;
    const outputPath = path.join(audioUploadDir, filename);
    const pcmBuffer = await generateGeminiSpeechPcm({ script, model, voice, speed, instructions });

    await convertPcmToMp3(pcmBuffer, outputPath);
    const audioBuffer = await fs.readFile(outputPath);
    const audioDurationMs = await getAudioDurationMs(audioBuffer);
    const currentPanel = await db('panels').where('id', panel.id).first();

    if (!currentPanel || currentPanel.tts_hash !== hash) {
      await fs.rm(outputPath, { force: true }).catch(() => {});
      return refreshPanelRenderReady(panel.id);
    }

    await deleteLocalUpload(currentPanel.audio_url);

    const updatedCount = await db('panels')
      .where('id', panel.id)
      .where('tts_hash', hash)
      .update({
        audio_url: uploadUrlFor('audio', filename),
        voice_id: voice,
        voice_speed: speed,
        tts_status: 'completed',
        tts_model: model,
        tts_hash: hash,
        tts_instructions: instructions,
        tts_error: null,
        audio_duration_ms: audioDurationMs,
        audio_file_size: audioBuffer.length,
        updated_at: new Date(),
      });

    if (updatedCount === 0) {
      await fs.rm(outputPath, { force: true }).catch(() => {});
      return refreshPanelRenderReady(panel.id);
    }

    await db('projects').where('id', panel.project_id).update({ updated_at: new Date() });
    return refreshPanelRenderReady(panel.id);
  } catch (error) {
    await markPanelTtsFailed(panel, error.message, { model, hash, instructions });
    throw createHttpError(error.message, error.statusCode || 500);
  }
}

async function generateProjectTts(projectId, options = {}) {
  const panels = await db('panels')
    .where('project_id', projectId)
    .orderBy('order_index', 'asc');

  if (panels.length === 0) {
    throw createHttpError('TTS를 생성할 패널이 없습니다.', 400);
  }

  const results = [];
  const errors = [];

  for (const panel of panels) {
    try {
      const updatedPanel = await generatePanelTts(panel.id, options);
      results.push(updatedPanel);
    } catch (error) {
      errors.push({
        panel_id: panel.id,
        message: error.message,
        statusCode: error.statusCode || 500,
      });
    }
  }

  return {
    panels: results,
    errors,
  };
}

module.exports = {
  DEFAULT_TTS_MODEL,
  SUPPORTED_TTS_VOICES,
  generatePanelTts,
  generateProjectTts,
  normalizeVoice,
  refreshPanelRenderReady,
};
