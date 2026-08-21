const { spawn } = require('child_process');
const crypto = require('crypto');
const fs = require('fs/promises');
const path = require('path');
const ffmpegPath = require('ffmpeg-static');
const sharp = require('sharp');
const { v4: uuidv4 } = require('uuid');
const db = require('../db');
const {
  localPathFromUploadUrl,
  renderUploadDir,
  uploadUrlFor,
} = require('../paths');

const VIDEO_WIDTH = 1080;
const VIDEO_HEIGHT = 1920;
const FPS = 30;
const FALLBACK_SCENE_DURATION_SECONDS = 3.5;

function createHttpError(message, statusCode, jobId) {
  const error = new Error(message);
  error.statusCode = statusCode;
  error.jobId = jobId;
  return error;
}

function formatRenderJob(job) {
  if (!job) return job;

  return {
    ...job,
    progress: Number(job.progress || 0),
  };
}

function normalizeColor(color, fallback) {
  return /^#[0-9a-f]{6}$/i.test(color || '') ? color : fallback;
}

function escapeXml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function wrapText(text, maxCharsPerLine) {
  const words = String(text).replace(/\s+/g, ' ').trim().split(' ');
  const lines = [];

  for (const word of words) {
    const lastLine = lines[lines.length - 1];

    if (!lastLine) {
      lines.push(word);
      continue;
    }

    if (`${lastLine} ${word}`.length <= maxCharsPerLine) {
      lines[lines.length - 1] = `${lastLine} ${word}`;
      continue;
    }

    lines.push(word);
  }

  return lines.flatMap((line) => {
    if (line.length <= maxCharsPerLine) return [line];

    const chunks = [];
    for (let index = 0; index < line.length; index += maxCharsPerLine) {
      chunks.push(line.slice(index, index + maxCharsPerLine));
    }
    return chunks;
  });
}

function createSubtitleSvg(panel) {
  const textColor = normalizeColor(panel.text_color, '#FFFFFF');
  const boxColor = normalizeColor(panel.background_color, '#000000');
  const fontSize = Math.min(Math.max(Number(panel.text_size || 22) * 2.4, 42), 92);
  const lineHeight = fontSize * 1.25;
  const maxCharsPerLine = Math.max(10, Math.floor(720 / (fontSize * 0.55)));
  const lines = wrapText(panel.script, maxCharsPerLine).slice(0, 8);
  const blockHeight = lines.length * lineHeight + 56;
  const y =
    panel.subtitle_position === 'top'
      ? 150
      : panel.subtitle_position === 'middle'
        ? (VIDEO_HEIGHT - blockHeight) / 2
        : VIDEO_HEIGHT - blockHeight - 170;
  const textStartY = y + 42 + fontSize * 0.75;
  const tspans = lines
    .map(
      (line, index) =>
        `<tspan x="${VIDEO_WIDTH / 2}" y="${textStartY + index * lineHeight}">${escapeXml(
          line
        )}</tspan>`
    )
    .join('');

  return Buffer.from(`
    <svg width="${VIDEO_WIDTH}" height="${VIDEO_HEIGHT}" xmlns="http://www.w3.org/2000/svg">
      <rect x="72" y="${y}" width="${VIDEO_WIDTH - 144}" height="${blockHeight}" rx="28" fill="${boxColor}" fill-opacity="0.78"/>
      <text text-anchor="middle" font-family="Arial, sans-serif" font-size="${fontSize}" font-weight="700" fill="${textColor}">
        ${tspans}
      </text>
    </svg>
  `);
}

function getSceneDurationSeconds(panel) {
  if (panel.audio_duration_ms && panel.audio_duration_ms > 0) {
    return Math.max(panel.audio_duration_ms / 1000, 0.5);
  }

  return FALLBACK_SCENE_DURATION_SECONDS;
}

async function updateJob(jobId, data) {
  await db('render_jobs')
    .where('id', jobId)
    .update({
      ...data,
      updated_at: new Date(),
    });

  return getRenderJob(jobId);
}

async function updateActiveJob(jobId, data) {
  await db('render_jobs')
    .where('id', jobId)
    .whereIn('status', ['pending', 'processing'])
    .update({
      ...data,
      updated_at: new Date(),
    });

  return getRenderJob(jobId);
}

async function getRenderJob(jobId) {
  const job = await db('render_jobs').where('id', jobId).first();
  return formatRenderJob(job);
}

async function uploadFileExists(uploadUrl) {
  const localPath = localPathFromUploadUrl(uploadUrl);
  if (!localPath) return false;

  try {
    await fs.access(localPath);
    return true;
  } catch {
    return false;
  }
}

async function isPanelReadyForRender(panel) {
  if (!panel.render_ready || panel.image_status !== 'ready' || panel.tts_status !== 'completed') {
    return false;
  }

  if (!panel.script?.trim() || !panel.image_url || !panel.audio_url || !panel.tts_hash) {
    return false;
  }

  const [imageExists, audioExists] = await Promise.all([
    uploadFileExists(panel.image_url),
    uploadFileExists(panel.audio_url),
  ]);

  return imageExists && audioExists;
}

async function assertPanelsReadyForRender(panels) {
  const readiness = await Promise.all(
    panels.map(async (panel) => ({
      panel,
      ready: await isPanelReadyForRender(panel),
    }))
  );
  const notReady = readiness.filter((item) => !item.ready);

  if (notReady.length > 0) {
    const labels = notReady
      .map((item) => {
        const scriptPreview = item.panel.script?.trim().slice(0, 24) || '빈 대본';
        return `#${item.panel.order_index + 1} ${scriptPreview}`;
      })
      .join(', ');
    throw createHttpError(`모든 씬에 이미지와 TTS가 준비되어야 Export할 수 있습니다. 준비 필요: ${labels}`, 400);
  }
}

async function ensureRenderJobActive(jobId, projectId) {
  const [job, project] = await Promise.all([
    db('render_jobs').where('id', jobId).first(),
    db('projects').where('id', projectId).first(),
  ]);

  if (!job || !project || !['pending', 'processing'].includes(job.status)) {
    const error = createHttpError('렌더 작업이 취소되었습니다.', 409, jobId);
    error.isRenderCancelled = true;
    throw error;
  }

  return job;
}

async function ensureFfmpeg(jobId) {
  if (!ffmpegPath) {
    throw createHttpError('FFmpeg 실행 파일을 찾을 수 없습니다.', 503, jobId);
  }
}

function runFfmpeg(args) {
  return new Promise((resolve, reject) => {
    const child = spawn(ffmpegPath, args, { windowsHide: true });
    let stderr = '';

    child.stderr.on('data', (chunk) => {
      stderr += chunk.toString();
    });
    child.on('error', reject);
    child.on('close', (code) => {
      if (code === 0) {
        resolve(stderr);
        return;
      }

      reject(new Error(`FFmpeg failed with code ${code}: ${stderr.slice(-2000)}`));
    });
  });
}

async function renderSceneImage(panel, sceneImagePath) {
  const backgroundColor = normalizeColor(panel.background_color, '#000000');
  const composites = [];
  const localImagePath =
    panel.image_status === 'ready' ? localPathFromUploadUrl(panel.image_url) : null;

  if (localImagePath) {
    try {
      const imageBuffer = await sharp(localImagePath)
        .rotate()
        .resize(VIDEO_WIDTH, VIDEO_HEIGHT, { fit: 'cover' })
        .png()
        .toBuffer();
      composites.push({ input: imageBuffer, left: 0, top: 0 });
    } catch (error) {
      console.warn('씬 이미지 합성 실패, 배경색으로 대체:', error.message);
    }
  }

  composites.push({ input: createSubtitleSvg(panel), left: 0, top: 0 });

  await sharp({
    create: {
      width: VIDEO_WIDTH,
      height: VIDEO_HEIGHT,
      channels: 4,
      background: backgroundColor,
    },
  })
    .composite(composites)
    .png()
    .toFile(sceneImagePath);
}

async function renderSceneVideo(panel, sceneImagePath, sceneVideoPath) {
  const durationSeconds = getSceneDurationSeconds(panel);
  const localAudioPath =
    panel.tts_status === 'completed' && panel.tts_hash
      ? localPathFromUploadUrl(panel.audio_url)
      : null;
  const audioExists = localAudioPath
    ? await fs
        .access(localAudioPath)
        .then(() => true)
        .catch(() => false)
    : false;
  const audioInputArgs = audioExists
    ? ['-i', localAudioPath]
    : [
        '-f',
        'lavfi',
        '-t',
        String(durationSeconds),
        '-i',
        'anullsrc=channel_layout=stereo:sample_rate=44100',
      ];

  await runFfmpeg([
    '-y',
    '-loop',
    '1',
    '-t',
    String(durationSeconds),
    '-i',
    sceneImagePath,
    ...audioInputArgs,
    '-map',
    '0:v:0',
    '-map',
    '1:a:0',
    '-t',
    String(durationSeconds),
    '-r',
    String(FPS),
    '-vf',
    'format=yuv420p',
    '-c:v',
    'libx264',
    '-preset',
    'veryfast',
    '-c:a',
    'aac',
    '-b:a',
    '128k',
    '-movflags',
    '+faststart',
    sceneVideoPath,
  ]);
}

async function concatScenes(sceneVideoPaths, outputPath, concatListPath) {
  const concatFile = sceneVideoPaths
    .map((filePath) => `file '${filePath.replace(/\\/g, '/').replace(/'/g, "'\\''")}'`)
    .join('\n');

  await fs.writeFile(concatListPath, concatFile);
  await runFfmpeg(['-y', '-f', 'concat', '-safe', '0', '-i', concatListPath, '-c', 'copy', outputPath]);
}

async function startProjectRender(projectId) {
  const project = await db('projects').where('id', projectId).first();

  if (!project) {
    throw createHttpError('프로젝트를 찾을 수 없습니다.', 404);
  }

  const panels = await db('panels').where('project_id', projectId).orderBy('order_index', 'asc');

  if (panels.length === 0) {
    throw createHttpError('렌더할 씬이 없습니다.', 400);
  }

  await assertPanelsReadyForRender(panels);

  const jobId = uuidv4();
  const now = new Date();
  await db('render_jobs').insert({
    id: jobId,
    project_id: projectId,
    status: 'pending',
    progress: 0,
    created_at: now,
    updated_at: now,
  });

  setImmediate(() => {
    renderProjectJob(jobId, projectId).catch((error) => {
      if (error.isRenderCancelled || error.statusCode === 409) {
        console.info(`[render:${jobId}] 렌더 작업이 취소되었습니다.`);
        return;
      }

      console.error('프로젝트 렌더 백그라운드 작업 오류:', error);
    });
  });

  return getRenderJob(jobId);
}

async function renderProjectJob(jobId, projectId) {
  const workDir = path.join(renderUploadDir, `tmp-${jobId}`);
  const outputFilename = `render-${projectId}-${Date.now()}-${crypto.randomBytes(4).toString('hex')}.mp4`;
  const outputPath = path.join(renderUploadDir, outputFilename);

  try {
    await ensureRenderJobActive(jobId, projectId);
    const panels = await db('panels').where('project_id', projectId).orderBy('order_index', 'asc');
    await assertPanelsReadyForRender(panels);
    await ensureFfmpeg(jobId);
    await fs.mkdir(workDir, { recursive: true });
    await fs.mkdir(renderUploadDir, { recursive: true });
    const processingJob = await updateActiveJob(jobId, { status: 'processing', progress: 5 });
    if (!processingJob || processingJob.status !== 'processing') {
      throw createHttpError('렌더 작업이 취소되었습니다.', 409, jobId);
    }

    const sceneVideoPaths = [];

    for (const [index, panel] of panels.entries()) {
      await ensureRenderJobActive(jobId, projectId);

      const sceneImagePath = path.join(workDir, `scene-${index}.png`);
      const sceneVideoPath = path.join(workDir, `scene-${index}.mp4`);

      await renderSceneImage(panel, sceneImagePath);
      await ensureRenderJobActive(jobId, projectId);

      await renderSceneVideo(panel, sceneImagePath, sceneVideoPath);
      await ensureRenderJobActive(jobId, projectId);

      sceneVideoPaths.push(sceneVideoPath);

      const progress = 5 + Math.round(((index + 1) / panels.length) * 80);
      await updateJob(jobId, { progress });
    }

    const outputUrl = uploadUrlFor('renders', outputFilename);

    await ensureRenderJobActive(jobId, projectId);
    await concatScenes(sceneVideoPaths, outputPath, path.join(workDir, 'concat.txt'));
    await ensureRenderJobActive(jobId, projectId);

    const completedJob = await updateActiveJob(jobId, {
      status: 'completed',
      progress: 100,
      output_url: outputUrl,
      error_message: null,
    });

    if (!completedJob || completedJob.status !== 'completed') {
      await fs.rm(outputPath, { force: true });
      throw createHttpError('렌더 작업이 취소되었습니다.', 409, jobId);
    }

    await db('projects').where('id', projectId).update({
      status: 'completed',
      updated_at: new Date(),
    });

    return completedJob;
  } catch (error) {
    await fs.rm(outputPath, { force: true }).catch(() => {});
    await updateJob(jobId, {
      status: 'failed',
      error_message: error.message,
    }).catch(() => {});

    throw createHttpError(error.message, error.statusCode || 500, jobId);
  } finally {
    await fs.rm(workDir, { recursive: true, force: true });
  }
}

async function cancelProjectRenderJobs(projectId) {
  return db('render_jobs')
    .where('project_id', projectId)
    .whereIn('status', ['pending', 'processing'])
    .update({
      status: 'failed',
      error_message: '프로젝트가 삭제되어 렌더 작업이 취소되었습니다.',
      updated_at: new Date(),
    });
}

module.exports = {
  cancelProjectRenderJobs,
  getRenderJob,
  startProjectRender,
};
