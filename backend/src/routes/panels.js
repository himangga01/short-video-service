const express = require('express');
const router = express.Router();
const db = require('../db');
const { v4: uuidv4 } = require('uuid');
const crypto = require('crypto');
const fs = require('fs/promises');
const path = require('path');
const multer = require('multer');
const sharp = require('sharp');
const { imageUploadDir, localPathFromUploadUrl, uploadUrlFor } = require('../paths');
const {
  SUPPORTED_TTS_VOICES,
  generatePanelTts,
  generateProjectTts,
} = require('../services/ttsService');

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: Number(process.env.MAX_FILE_SIZE || 10 * 1024 * 1024),
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
      return;
    }
    const error = new Error('JPG, PNG, WebP, GIF 이미지만 업로드할 수 있습니다.');
    error.statusCode = 400;
    cb(error);
  },
});

const uploadImage = upload.single('image');
const FORBIDDEN_MEDIA_FIELDS = new Set([
  'image_url',
  'audio_url',
  'image_status',
  'image_error',
  'tts_status',
  'tts_error',
  'tts_hash',
  'tts_model',
  'audio_duration_ms',
  'audio_file_size',
]);
const SUPPORTED_VOICES = new Set(SUPPORTED_TTS_VOICES);
const SUBTITLE_POSITIONS = new Set(['top', 'middle', 'bottom']);
const TRANSITION_TYPES = new Set(['none', 'fade']);
const HEX_COLOR_PATTERN = /^#[0-9a-f]{6}$/i;

function parseNumberSetting(value, field, { min, max, integer = false }) {
  const numericValue =
    typeof value === 'number' ? value : typeof value === 'string' && value.trim() ? Number(value) : NaN;

  if (!Number.isFinite(numericValue)) {
    return { error: `${field} 값은 숫자여야 합니다.` };
  }

  if (integer && !Number.isInteger(numericValue)) {
    return { error: `${field} 값은 정수여야 합니다.` };
  }

  if (numericValue < min || numericValue > max) {
    return { error: `${field} 값은 ${min}~${max} 범위여야 합니다.` };
  }

  return { value: numericValue };
}

function parseEnumSetting(value, field, allowedValues) {
  if (typeof value !== 'string' || !allowedValues.has(value)) {
    return { error: `${field} 값이 유효하지 않습니다.` };
  }

  return { value };
}

function parseHexColorSetting(value, field) {
  const normalizedValue = typeof value === 'string' ? value.trim() : '';
  if (!HEX_COLOR_PATTERN.test(normalizedValue)) {
    return { error: `${field} 값은 #RRGGBB 형식이어야 합니다.` };
  }

  return { value: normalizedValue.toUpperCase() };
}

function parseNullableStringSetting(value, field, maxLength) {
  if (value === null || value === '') {
    return { value: null };
  }

  if (typeof value !== 'string') {
    return { error: `${field} 값은 문자열이어야 합니다.` };
  }

  const normalizedValue = value.trim();
  if (normalizedValue.length > maxLength) {
    return { error: `${field} 값은 ${maxLength}자 이하여야 합니다.` };
  }

  return { value: normalizedValue || null };
}

function validatePanelSettings(body, { includeOrderIndex = false } = {}) {
  const data = {};
  const validators = {
    voice_id: () => parseEnumSetting(body.voice_id, 'voice_id', SUPPORTED_VOICES),
    voice_speed: () => parseNumberSetting(body.voice_speed, 'voice_speed', { min: 0.25, max: 4 }),
    text_size: () => parseNumberSetting(body.text_size, 'text_size', { min: 12, max: 48, integer: true }),
    text_color: () => parseHexColorSetting(body.text_color, 'text_color'),
    background_color: () => parseHexColorSetting(body.background_color, 'background_color'),
    subtitle_position: () => parseEnumSetting(body.subtitle_position, 'subtitle_position', SUBTITLE_POSITIONS),
    transition_type: () => parseEnumSetting(body.transition_type, 'transition_type', TRANSITION_TYPES),
    transition_duration_ms: () =>
      parseNumberSetting(body.transition_duration_ms, 'transition_duration_ms', {
        min: 0,
        max: 5000,
        integer: true,
      }),
    tts_instructions: () => parseNullableStringSetting(body.tts_instructions, 'tts_instructions', 1000),
  };

  if (includeOrderIndex) {
    validators.order_index = () =>
      parseNumberSetting(body.order_index, 'order_index', { min: 0, max: 10000, integer: true });
  }

  for (const [field, validate] of Object.entries(validators)) {
    if (body[field] === undefined) continue;

    const result = validate();
    if (result.error) {
      return { error: result.error };
    }
    data[field] = result.value;
  }

  return { data };
}

function runImageUpload(req, res) {
  return new Promise((resolve, reject) => {
    uploadImage(req, res, (error) => {
      if (error) {
        reject(error);
        return;
      }

      resolve();
    });
  });
}

function isValidReorderItem(item) {
  return (
    item &&
    typeof item.id === 'string' &&
    Number.isInteger(item.order_index) &&
    item.order_index >= 0
  );
}

function isRenderReady(panel) {
  return Boolean(panel.script && panel.image_url && panel.audio_url);
}

function formatPanel(panel) {
  if (!panel) return panel;

  return {
    ...panel,
    render_ready: Boolean(panel.render_ready),
  };
}

async function refreshPanelRenderReady(panelId) {
  const panel = await db('panels').where('id', panelId).first();
  if (!panel) return null;

  const renderReady = await isPanelRenderReady(panel);
  await db('panels').where('id', panelId).update({ render_ready: renderReady });

  const updatedPanel = await db('panels').where('id', panelId).first();
  return formatPanel(updatedPanel);
}

async function fileExistsFromUploadUrl(url) {
  const localPath = localPathFromUploadUrl(url);
  if (!localPath) return false;

  try {
    await fs.access(localPath);
    return true;
  } catch {
    return false;
  }
}

async function isPanelRenderReady(panel) {
  if (
    !isRenderReady(panel) ||
    panel.image_status !== 'ready' ||
    panel.tts_status !== 'completed' ||
    !panel.tts_hash
  ) {
    return false;
  }

  const [hasImageFile, hasAudioFile] = await Promise.all([
    fileExistsFromUploadUrl(panel.image_url),
    fileExistsFromUploadUrl(panel.audio_url),
  ]);

  return hasImageFile && hasAudioFile;
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

function hasForbiddenMediaFields(body) {
  return Object.keys(body).some((field) => FORBIDDEN_MEDIA_FIELDS.has(field));
}

function didTtsSourceChange(panel, updateData) {
  if (updateData.script !== undefined && updateData.script !== panel.script) return true;
  if (updateData.voice_id !== undefined && updateData.voice_id !== panel.voice_id) return true;
  if (updateData.voice_speed !== undefined && Number(updateData.voice_speed) !== Number(panel.voice_speed)) {
    return true;
  }
  if (
    updateData.tts_instructions !== undefined &&
    (updateData.tts_instructions || null) !== (panel.tts_instructions || null)
  ) {
    return true;
  }

  return false;
}

async function invalidatePanelTts(panel, updateData) {
  if (!didTtsSourceChange(panel, updateData)) return;

  await deleteLocalUpload(panel.audio_url);
  Object.assign(updateData, {
    audio_url: null,
    tts_status: 'idle',
    tts_model: null,
    tts_hash: null,
    tts_error: null,
    audio_duration_ms: null,
    audio_file_size: null,
    render_ready: false,
  });
}

function isSharpInputError(error) {
  return /unsupported image format|Input buffer contains unsupported|corrupt/i.test(error.message);
}

// 프로젝트별 패널 목록 조회
router.get('/project/:projectId', async (req, res) => {
  try {
    const { projectId } = req.params;

    const panels = await db('panels')
      .where('project_id', projectId)
      .orderBy('order_index', 'asc');

    res.json({ panels: panels.map(formatPanel) });
  } catch (error) {
    console.error('패널 목록 조회 오류:', error);
    res.status(500).json({ error: error.message });
  }
});

// 패널 순서 변경. 이 라우트는 /:id 수정 라우트보다 먼저 선언되어야 합니다.
router.put('/reorder', async (req, res) => {
  try {
    const { panels } = req.body;

    if (!Array.isArray(panels)) {
      return res.status(400).json({ error: 'panels 배열이 필요합니다.' });
    }

    if (!panels.every(isValidReorderItem)) {
      return res.status(400).json({ error: '각 패널에는 id와 0 이상의 order_index가 필요합니다.' });
    }

    const panelIds = panels.map(({ id }) => id);
    const uniquePanelIds = new Set(panelIds);

    if (uniquePanelIds.size !== panelIds.length) {
      return res.status(400).json({ error: '중복된 패널 ID가 포함되어 있습니다.' });
    }

    if (panelIds.length === 0) {
      return res.json({ message: '변경할 패널이 없습니다.' });
    }

    const existingPanels = await db('panels').whereIn('id', panelIds);

    if (existingPanels.length !== panelIds.length) {
      return res.status(404).json({ error: '일부 패널을 찾을 수 없습니다.' });
    }

    const projectIds = new Set(existingPanels.map((panel) => panel.project_id));

    if (projectIds.size !== 1) {
      return res.status(400).json({ error: '같은 프로젝트의 패널만 함께 정렬할 수 있습니다.' });
    }

    await db.transaction(async (trx) => {
      for (const { id, order_index } of panels) {
        await trx('panels')
          .where('id', id)
          .update({ order_index, updated_at: new Date() });
      }

      const [projectId] = projectIds;
      await trx('projects').where('id', projectId).update({ updated_at: new Date() });
    });

    res.json({ message: '패널 순서가 변경되었습니다.' });
  } catch (error) {
    console.error('패널 순서 변경 오류:', error);
    res.status(500).json({ error: error.message });
  }
});

// 프로젝트 전체 TTS 생성
router.post('/project/:projectId/tts', async (req, res) => {
  try {
    const { projectId } = req.params;
    const { instructions } = req.body;
    const result = await generateProjectTts(projectId, { instructions });

    res.status(result.errors.length > 0 ? 207 : 200).json(result);
  } catch (error) {
    console.error('프로젝트 TTS 생성 오류:', error);
    res.status(error.statusCode || error.status || 500).json({ error: error.message });
  }
});

// 패널 TTS 생성
router.post('/:id/tts', async (req, res) => {
  try {
    const { id } = req.params;
    const { instructions } = req.body;
    const panel = await generatePanelTts(id, { instructions });

    res.json(panel);
  } catch (error) {
    const statusCode = error.statusCode || error.status || 500;

    if (statusCode >= 500 && ![503, 504].includes(statusCode)) {
      console.error('패널 TTS 생성 오류:', error);
    } else {
      console.warn('패널 TTS 생성 입력 오류:', error.message);
    }

    res.status(statusCode).json({ error: error.message });
  }
});

// 패널 이미지 업로드
router.post('/:id/image', async (req, res) => {
  try {
    await runImageUpload(req, res);

    const { id } = req.params;

    const panel = await db('panels').where('id', id).first();

    if (!panel) {
      return res.status(404).json({ error: '패널을 찾을 수 없습니다.' });
    }

    if (!req.file) {
      return res.status(400).json({ error: '이미지 파일이 필요합니다.' });
    }

    await fs.mkdir(imageUploadDir, { recursive: true });

    const image = sharp(req.file.buffer, { animated: false }).rotate();
    const metadata = await image.metadata();
    const filename = `${Date.now()}-${crypto.randomBytes(6).toString('hex')}.webp`;
    const outputPath = path.join(imageUploadDir, filename);

    const output = await image
      .resize({ width: 1080, height: 1920, fit: 'inside', withoutEnlargement: true })
      .webp({ quality: 84 })
      .toFile(outputPath);

    await deleteLocalUpload(panel.image_url);

    await db('panels').where('id', id).update({
      image_url: uploadUrlFor('images', filename),
      image_status: 'ready',
      image_error: null,
      image_width: output.width || metadata.width || null,
      image_height: output.height || metadata.height || null,
      image_file_size: output.size || null,
      updated_at: new Date(),
    });

    const updatedPanel = await refreshPanelRenderReady(id);
    await db('projects').where('id', panel.project_id).update({ updated_at: new Date() });

    res.json(updatedPanel);
  } catch (error) {
    const isClientUploadError =
      error instanceof multer.MulterError || error.statusCode === 400 || isSharpInputError(error);

    if (isClientUploadError) {
      console.warn('패널 이미지 업로드 입력 오류:', error.message);
    } else {
      console.error('패널 이미지 업로드 오류:', error);
    }

    res.status(isClientUploadError ? 400 : 500).json({ error: error.message });
  }
});

// 패널 이미지 삭제
router.delete('/:id/image', async (req, res) => {
  try {
    const { id } = req.params;
    const panel = await db('panels').where('id', id).first();

    if (!panel) {
      return res.status(404).json({ error: '패널을 찾을 수 없습니다.' });
    }

    await deleteLocalUpload(panel.image_url);

    await db('panels').where('id', id).update({
      image_url: null,
      image_status: 'empty',
      image_error: null,
      image_width: null,
      image_height: null,
      image_file_size: null,
      updated_at: new Date(),
    });

    const updatedPanel = await refreshPanelRenderReady(id);
    await db('projects').where('id', panel.project_id).update({ updated_at: new Date() });

    res.json(updatedPanel);
  } catch (error) {
    console.error('패널 이미지 삭제 오류:', error);
    res.status(500).json({ error: error.message });
  }
});

// 패널 상세 조회
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const panel = await db('panels').where('id', id).first();

    if (!panel) {
      return res.status(404).json({ error: '패널을 찾을 수 없습니다.' });
    }

    res.json(formatPanel(panel));
  } catch (error) {
    console.error('패널 조회 오류:', error);
    res.status(500).json({ error: error.message });
  }
});

// 패널 생성
router.post('/', async (req, res) => {
  try {
    const { project_id, script } = req.body;
    const normalizedScript = typeof script === 'string' ? script.trim() : '';
    const { data: panelSettings, error: settingsError } = validatePanelSettings(req.body, {
      includeOrderIndex: true,
    });

    if (hasForbiddenMediaFields(req.body)) {
      return res.status(400).json({
        error: '이미지와 오디오는 전용 업로드/TTS API로만 변경할 수 있습니다.',
      });
    }

    if (settingsError) {
      return res.status(400).json({ error: settingsError });
    }

    if (!project_id || !normalizedScript) {
      return res.status(400).json({ error: '프로젝트 ID와 대본은 필수입니다.' });
    }

    const project = await db('projects').where('id', project_id).first();
    if (!project) {
      return res.status(404).json({ error: '프로젝트를 찾을 수 없습니다.' });
    }

    let finalOrderIndex = panelSettings.order_index;
    if (finalOrderIndex === undefined) {
      const lastPanel = await db('panels')
        .where('project_id', project_id)
        .orderBy('order_index', 'desc')
        .first();
      finalOrderIndex = lastPanel ? lastPanel.order_index + 1 : 0;
    }

    const panelId = uuidv4();

    await db('panels').insert({
      id: panelId,
      project_id,
      script: normalizedScript,
      image_url: null,
      audio_url: null,
      voice_id: panelSettings.voice_id || 'Kore',
      voice_speed: panelSettings.voice_speed || 1.0,
      text_size: panelSettings.text_size || 22,
      text_color: panelSettings.text_color || '#FFFFFF',
      background_color: panelSettings.background_color || '#000000',
      image_status: 'empty',
      tts_status: 'idle',
      render_ready: false,
      subtitle_position: panelSettings.subtitle_position || 'bottom',
      transition_type: panelSettings.transition_type || 'none',
      transition_duration_ms: panelSettings.transition_duration_ms || 0,
      order_index: finalOrderIndex,
    });

    const panel = await db('panels').where('id', panelId).first();

    await db('projects').where('id', project_id).update({ updated_at: new Date() });

    res.status(201).json(formatPanel(panel));
  } catch (error) {
    console.error('패널 생성 오류:', error);
    res.status(500).json({ error: error.message });
  }
});

// 패널 수정
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { script } = req.body;
    const { data: panelSettings, error: settingsError } = validatePanelSettings(req.body);

    if (hasForbiddenMediaFields(req.body)) {
      return res.status(400).json({
        error: '이미지와 오디오는 전용 업로드/TTS API로만 변경할 수 있습니다.',
      });
    }

    if (settingsError) {
      return res.status(400).json({ error: settingsError });
    }

    const panel = await db('panels').where('id', id).first();

    if (!panel) {
      return res.status(404).json({ error: '패널을 찾을 수 없습니다.' });
    }

    const updateData = {};
    if (script !== undefined) {
      const normalizedScript = typeof script === 'string' ? script.trim() : '';
      if (!normalizedScript) {
        return res.status(400).json({ error: '대본은 비워둘 수 없습니다.' });
      }
      updateData.script = normalizedScript;
    }
    Object.assign(updateData, panelSettings);

    if (Object.keys(updateData).length > 0) {
      await invalidatePanelTts(panel, updateData);
      updateData.updated_at = new Date();
      await db('panels').where('id', id).update(updateData);
    }

    const updatedPanel = await refreshPanelRenderReady(id);

    await db('projects').where('id', panel.project_id).update({ updated_at: new Date() });

    res.json(formatPanel(updatedPanel));
  } catch (error) {
    console.error('패널 수정 오류:', error);
    res.status(500).json({ error: error.message });
  }
});

// 패널 삭제
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const panel = await db('panels').where('id', id).first();

    if (!panel) {
      return res.status(404).json({ error: '패널을 찾을 수 없습니다.' });
    }

    await Promise.all([deleteLocalUpload(panel.image_url), deleteLocalUpload(panel.audio_url)]);
    await db('panels').where('id', id).delete();

    await db('projects').where('id', panel.project_id).update({ updated_at: new Date() });

    res.json({ message: '패널이 삭제되었습니다.', id });
  } catch (error) {
    console.error('패널 삭제 오류:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
