const express = require('express');
const router = express.Router();
const { getRenderJob, startProjectRender } = require('../services/renderService');

router.post('/project/:projectId', async (req, res) => {
  try {
    const job = await startProjectRender(req.params.projectId);
    res.status(202).json(job);
  } catch (error) {
    const statusCode = error.statusCode || 500;

    if (statusCode >= 500) {
      console.error('프로젝트 렌더 오류:', error);
    } else {
      console.warn('프로젝트 렌더 입력 오류:', error.message);
    }

    res.status(statusCode).json({ error: error.message });
  }
});

router.get('/jobs/:jobId', async (req, res) => {
  try {
    const job = await getRenderJob(req.params.jobId);

    if (!job) {
      return res.status(404).json({ error: '렌더 작업을 찾을 수 없습니다.' });
    }

    res.json(job);
  } catch (error) {
    console.error('렌더 작업 조회 오류:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
