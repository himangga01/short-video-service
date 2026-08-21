const express = require('express');
const router = express.Router();
const db = require('../db');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs/promises');
const { localPathFromUploadUrl } = require('../paths');
const { cancelProjectRenderJobs } = require('../services/renderService');

function parsePagination(limit = 50, offset = 0) {
  const parsedLimit = Number.parseInt(limit, 10);
  const parsedOffset = Number.parseInt(offset, 10);

  return {
    limit: Number.isFinite(parsedLimit) ? Math.min(Math.max(parsedLimit, 1), 100) : 50,
    offset: Number.isFinite(parsedOffset) ? Math.max(parsedOffset, 0) : 0,
  };
}

function applyProjectFilters(query, { status, search }) {
  if (status) {
    query.where('status', status);
  }

  if (search) {
    query.where(function () {
      this.where('title', 'like', `%${search}%`)
        .orWhere('description', 'like', `%${search}%`)
        .orWhere('channel_name', 'like', `%${search}%`);
    });
  }

  return query;
}

function formatProject(project) {
  if (!project) return project;

  return {
    ...project,
    show_author: Boolean(project.show_author),
    panels: project.panels ? project.panels.map(formatPanelForProject) : project.panels,
  };
}

function formatPanelForProject(panel) {
  return {
    ...panel,
    render_ready: Boolean(panel.render_ready),
  };
}

async function deleteLocalUpload(url) {
  const localPath = localPathFromUploadUrl(url);
  if (!localPath) return;

  try {
    await fs.unlink(localPath);
  } catch (error) {
    if (error.code !== 'ENOENT') {
      console.warn('프로젝트 미디어 파일 삭제 실패:', error.message);
    }
  }
}

async function deleteProjectMediaFiles(projectId) {
  const [panels, renderJobs] = await Promise.all([
    db('panels').where('project_id', projectId).select('image_url', 'audio_url'),
    db('render_jobs').where('project_id', projectId).select('output_url'),
  ]);
  const urls = new Set();

  panels.forEach((panel) => {
    if (panel.image_url) urls.add(panel.image_url);
    if (panel.audio_url) urls.add(panel.audio_url);
  });
  renderJobs.forEach((job) => {
    if (job.output_url) urls.add(job.output_url);
  });

  await Promise.all([...urls].map((url) => deleteLocalUpload(url)));
}

// 프로젝트 목록 조회
router.get('/', async (req, res) => {
  try {
    const { status, search, limit = 50, offset = 0 } = req.query;
    const pagination = parsePagination(limit, offset);

    const baseQuery = applyProjectFilters(db('projects'), { status, search });
    const [{ count }] = await baseQuery.clone().count({ count: '*' });

    const projects = await baseQuery
      .clone()
      .select('*')
      .orderBy('updated_at', 'desc')
      .limit(pagination.limit)
      .offset(pagination.offset);

    res.json({ projects: projects.map(formatProject), total: Number(count) });
  } catch (error) {
    console.error('프로젝트 목록 조회 오류:', error);
    res.status(500).json({ error: error.message });
  }
});

// 프로젝트 상세 조회
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const project = await db('projects').where('id', id).first();

    if (!project) {
      return res.status(404).json({ error: '프로젝트를 찾을 수 없습니다.' });
    }

    const panels = await db('panels').where('project_id', id).orderBy('order_index', 'asc');

    res.json(formatProject({ ...project, panels }));
  } catch (error) {
    console.error('프로젝트 조회 오류:', error);
    res.status(500).json({ error: error.message });
  }
});

// 프로젝트 생성
router.post('/', async (req, res) => {
  try {
    const { title, description, channel_name, view_count, show_author } = req.body;
    const normalizedTitle = typeof title === 'string' ? title.trim() : '';

    if (!normalizedTitle) {
      return res.status(400).json({ error: '제목은 필수입니다.' });
    }

    const projectId = uuidv4();

    await db('projects').insert({
      id: projectId,
      title: normalizedTitle,
      description: description || '',
      channel_name: channel_name || '',
      view_count: view_count || 0,
      show_author: show_author !== undefined ? show_author : true,
      status: 'draft',
    });

    const project = await db('projects').where('id', projectId).first();

    res.status(201).json(formatProject(project));
  } catch (error) {
    console.error('프로젝트 생성 오류:', error);
    res.status(500).json({ error: error.message });
  }
});

// 프로젝트 수정
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, channel_name, view_count, show_author, status } = req.body;

    const project = await db('projects').where('id', id).first();

    if (!project) {
      return res.status(404).json({ error: '프로젝트를 찾을 수 없습니다.' });
    }

    const updateData = {};
    if (title !== undefined) {
      const normalizedTitle = typeof title === 'string' ? title.trim() : '';
      if (!normalizedTitle) {
        return res.status(400).json({ error: '제목은 비워둘 수 없습니다.' });
      }
      updateData.title = normalizedTitle;
    }
    if (description !== undefined) updateData.description = description;
    if (channel_name !== undefined) updateData.channel_name = channel_name;
    if (view_count !== undefined) updateData.view_count = view_count;
    if (show_author !== undefined) updateData.show_author = show_author;
    if (status !== undefined) updateData.status = status;

    if (Object.keys(updateData).length > 0) {
      updateData.updated_at = new Date();
      await db('projects').where('id', id).update(updateData);
    }

    const updatedProject = await db('projects').where('id', id).first();

    res.json(formatProject(updatedProject));
  } catch (error) {
    console.error('프로젝트 수정 오류:', error);
    res.status(500).json({ error: error.message });
  }
});

// 프로젝트 삭제
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const project = await db('projects').where('id', id).first();

    if (!project) {
      return res.status(404).json({ error: '프로젝트를 찾을 수 없습니다.' });
    }

    await cancelProjectRenderJobs(id);
    await deleteProjectMediaFiles(id);
    await db('projects').where('id', id).delete();

    res.json({ message: '프로젝트가 삭제되었습니다.', id });
  } catch (error) {
    console.error('프로젝트 삭제 오류:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
