import { useEffect, useMemo, useRef, useState } from 'react';
import EditorToolbar from './EditorToolbar';
import ProjectReadinessPanel from './ProjectReadinessPanel';
import ScriptImportModal from './ScriptImportModal';
import SceneTimeline from './SceneTimeline';
import VideoPreviewCanvas from './VideoPreviewCanvas';
import { mediaUrl } from '../api/media';
import { renderApi } from '../api/render';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import {
  createPanel,
  generateProjectTTS,
  reorderPanels,
  reorderPanelsLocally,
  setSelectedPanel,
} from '../store/slices/panelsSlice';
import type { Panel, RenderJob } from '../types';

const FALLBACK_SCENE_DURATION_MS = 3500;

function getPanelDuration(panel: Panel) {
  return panel.audio_duration_ms || FALLBACK_SCENE_DURATION_MS;
}

function wait(ms: number) {
  return new Promise((resolve) => {
    window.setTimeout(resolve, ms);
  });
}

export default function EditorWorkspace() {
  const dispatch = useAppDispatch();
  const { panels, selectedPanelId, saving, saveError } = useAppSelector((state) => state.panels);
  const { currentProject } = useAppSelector((state) => state.projects);
  const [playingPanelId, setPlayingPanelId] = useState<string | null>(null);
  const [playheadProgress, setPlayheadProgress] = useState(0);
  const [renderJob, setRenderJob] = useState<RenderJob | null>(null);
  const [renderError, setRenderError] = useState<string | null>(null);
  const [isRendering, setIsRendering] = useState(false);
  const [scriptImportOpen, setScriptImportOpen] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const sceneTimerRef = useRef<number | null>(null);

  const selectedPanel = panels.find((panel) => panel.id === selectedPanelId) || panels[0];
  const previewPanel = panels.find((panel) => panel.id === playingPanelId) || selectedPanel;
  const isGeneratingTTS = panels.some(
    (panel) => panel.tts_status === 'queued' || panel.tts_status === 'processing'
  );
  const readinessCounts = useMemo(() => {
    const missingScript = panels.filter((panel) => !panel.script.trim()).length;
    const missingImage = panels.filter(
      (panel) => panel.image_status !== 'ready' || !panel.image_url
    ).length;
    const missingTts = panels.filter(
      (panel) =>
        panel.tts_status !== 'completed' || !panel.audio_url || !panel.tts_hash
    ).length;

    return { missingScript, missingImage, missingTts };
  }, [panels]);
  const canExportProject = panels.length > 0 && panels.every((panel) => panel.render_ready);
  const exportDisabledReason = useMemo(() => {
    if (panels.length === 0) return '렌더할 씬이 필요합니다.';

    const missingParts = [
      readinessCounts.missingScript ? `대본 ${readinessCounts.missingScript}개` : null,
      readinessCounts.missingImage ? `이미지 ${readinessCounts.missingImage}개` : null,
      readinessCounts.missingTts ? `TTS ${readinessCounts.missingTts}개` : null,
    ].filter(Boolean);

    return missingParts.length
      ? `Export 준비 필요: ${missingParts.join(', ')}`
      : '모든 씬의 렌더 준비 상태를 다시 확인해주세요.';
  }, [panels.length, readinessCounts]);

  const totalDurationMs = useMemo(
    () => panels.reduce((total, panel) => total + getPanelDuration(panel), 0),
    [panels]
  );

  useEffect(() => {
    if (!selectedPanelId && panels.length > 0) {
      dispatch(setSelectedPanel(panels[0].id));
    }
  }, [dispatch, panels, selectedPanelId]);

  useEffect(() => {
    return () => {
      clearPlaybackResources();
    };
  }, []);

  const handleAddScene = async () => {
    if (!currentProject) return;

    const result = await dispatch(
      createPanel({
        project_id: currentProject.id,
        script: '새 씬 대본을 입력하세요.',
      })
    );

    if (createPanel.fulfilled.match(result)) {
      dispatch(setSelectedPanel(result.payload.id));
    }
  };

  const handleImportScripts = async (scripts: string[]) => {
    if (!currentProject) return;

    let firstCreatedPanelId: string | null = null;

    for (const script of scripts) {
      const result = await dispatch(
        createPanel({
          project_id: currentProject.id,
          script,
        })
      );

      if (createPanel.fulfilled.match(result) && !firstCreatedPanelId) {
        firstCreatedPanelId = result.payload.id;
      }
    }

    if (firstCreatedPanelId) {
      dispatch(setSelectedPanel(firstCreatedPanelId));
    }
  };

  const clearPlaybackResources = () => {
    if (sceneTimerRef.current) {
      window.clearInterval(sceneTimerRef.current);
      sceneTimerRef.current = null;
    }

    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = '';
      audioRef.current.onended = null;
      audioRef.current.onerror = null;
      audioRef.current.ontimeupdate = null;
      audioRef.current = null;
    }
  };

  const stopPlayback = () => {
    clearPlaybackResources();
    setPlayingPanelId(null);
    setPlayheadProgress(0);
  };

  const updateSceneSelection = (panel: Panel) => {
    setPlayingPanelId(panel.id);
    dispatch(setSelectedPanel(panel.id));
  };

  const playNextScene = (nextIndex: number, elapsedBeforeScene: number) => {
    if (nextIndex >= panels.length || elapsedBeforeScene >= totalDurationMs) {
      stopPlayback();
      return;
    }

    playScene(nextIndex, elapsedBeforeScene);
  };

  const playFallbackScene = (sceneIndex: number, elapsedBeforeScene: number) => {
    const panel = panels[sceneIndex];
    const sceneDurationMs = getPanelDuration(panel);
    const startedAt = performance.now();

    sceneTimerRef.current = window.setInterval(() => {
      const sceneElapsedMs = Math.min(sceneDurationMs, performance.now() - startedAt);
      const elapsed = elapsedBeforeScene + sceneElapsedMs;
      setPlayheadProgress(Math.min(100, (elapsed / totalDurationMs) * 100));

      if (sceneElapsedMs >= sceneDurationMs) {
        if (sceneTimerRef.current) {
          window.clearInterval(sceneTimerRef.current);
          sceneTimerRef.current = null;
        }
        playNextScene(sceneIndex + 1, elapsedBeforeScene + sceneDurationMs);
      }
    }, 100);
  };

  const playAudioScene = (sceneIndex: number, elapsedBeforeScene: number, audioUrl: string) => {
    const panel = panels[sceneIndex];
    const sceneDurationMs = getPanelDuration(panel);
    const audio = new Audio(audioUrl);
    audioRef.current = audio;

    audio.ontimeupdate = () => {
      const elapsed = elapsedBeforeScene + audio.currentTime * 1000;
      setPlayheadProgress(Math.min(100, (elapsed / totalDurationMs) * 100));
    };
    audio.onended = () => {
      const actualDurationMs =
        Number.isFinite(audio.duration) && audio.duration > 0
          ? audio.duration * 1000
          : sceneDurationMs;

      audioRef.current = null;
      playNextScene(sceneIndex + 1, elapsedBeforeScene + actualDurationMs);
    };
    audio.onerror = () => {
      audioRef.current = null;
      playFallbackScene(sceneIndex, elapsedBeforeScene);
    };

    audio.play().catch(() => {
      audioRef.current = null;
      playFallbackScene(sceneIndex, elapsedBeforeScene);
    });
  };

  const playScene = (sceneIndex: number, elapsedBeforeScene: number) => {
    const panel = panels[sceneIndex];
    if (!panel) {
      stopPlayback();
      return;
    }

    clearPlaybackResources();
    updateSceneSelection(panel);
    setPlayheadProgress(Math.min(100, (elapsedBeforeScene / totalDurationMs) * 100));

    const audioUrl = mediaUrl(panel.audio_url);
    if (audioUrl) {
      playAudioScene(sceneIndex, elapsedBeforeScene, audioUrl);
      return;
    }

    playFallbackScene(sceneIndex, elapsedBeforeScene);
  };

  const startPlayback = () => {
    if (panels.length === 0 || totalDurationMs === 0) return;
    playScene(0, 0);
  };

  const handleTogglePlayback = () => {
    if (playingPanelId) {
      stopPlayback();
      return;
    }

    startPlayback();
  };

  const handleGenerateProjectTTS = () => {
    if (!currentProject) return;
    dispatch(generateProjectTTS({ projectId: currentProject.id }));
  };

  const handleSelectScene = (id: string) => {
    dispatch(setSelectedPanel(id));
  };

  const handleExport = async () => {
    if (!currentProject || panels.length === 0) return;
    if (!canExportProject) {
      setRenderError(exportDisabledReason);
      return;
    }

    setIsRendering(true);
    setRenderError(null);
    setRenderJob(null);

    try {
      let job = await renderApi.renderProject(currentProject.id);
      setRenderJob(job);

      for (let attempt = 0; attempt < 180 && job.status !== 'completed' && job.status !== 'failed'; attempt += 1) {
        await wait(1000);
        job = await renderApi.getJob(job.id);
        setRenderJob(job);
      }

      if (job.status === 'failed') {
        setRenderError(job.error_message || '렌더링에 실패했습니다.');
      } else if (job.status !== 'completed') {
        setRenderError('렌더링 시간이 초과되었습니다. 잠시 후 작업 상태를 다시 확인해주세요.');
      }
    } catch (error) {
      const message =
        typeof error === 'object' &&
        error !== null &&
        'response' in error &&
        (error as { response?: { data?: { error?: string; job?: RenderJob } } }).response?.data
          ? (error as { response: { data: { error?: string; job?: RenderJob } } }).response.data
              .error || '렌더링에 실패했습니다.'
          : error instanceof Error
            ? error.message
            : '렌더링에 실패했습니다.';
      const failedJob =
        typeof error === 'object' &&
        error !== null &&
        'response' in error &&
        (error as { response?: { data?: { job?: RenderJob } } }).response?.data?.job
          ? (error as { response: { data: { job: RenderJob } } }).response.data.job
          : null;

      setRenderError(message);
      setRenderJob(failedJob);
    } finally {
      setIsRendering(false);
    }
  };

  if (!currentProject) {
    return (
      <div className="h-full flex flex-col">
        <EditorToolbar
          totalDurationMs={0}
          sceneCount={0}
          canPreview={false}
          canGenerateTTS={false}
          canExport={false}
          exportDisabledReason="프로젝트를 선택해주세요."
          isGeneratingTTS={false}
          isRendering={false}
          isPlaying={false}
          onAddScene={handleAddScene}
          onExport={handleExport}
          onGenerateTTS={handleGenerateProjectTTS}
          onOpenScriptImport={() => setScriptImportOpen(true)}
          onTogglePlayback={handleTogglePlayback}
        />
        <div className="flex-1 grid place-items-center text-center text-gray-500">
          <div>
            <p className="text-lg font-medium text-gray-700">프로젝트를 선택해주세요</p>
            <p className="mt-2 text-sm">왼쪽에서 프로젝트를 선택하면 영상 작업대가 열립니다</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <EditorToolbar
        projectTitle={currentProject.title}
        totalDurationMs={totalDurationMs}
        sceneCount={panels.length}
        canPreview={panels.length > 0}
        canGenerateTTS={panels.length > 0}
        canExport={canExportProject}
        exportDisabledReason={exportDisabledReason}
        isGeneratingTTS={isGeneratingTTS}
        isRendering={isRendering}
        isPlaying={Boolean(playingPanelId)}
        saveStatus={saving ? 'saving' : saveError ? 'failed' : 'saved'}
        saveError={saveError}
        onAddScene={handleAddScene}
        onExport={handleExport}
        onGenerateTTS={handleGenerateProjectTTS}
        onOpenScriptImport={() => setScriptImportOpen(true)}
        onTogglePlayback={handleTogglePlayback}
      />

      <div className="flex-1 overflow-y-auto bg-gray-100">
        <div className="min-h-full p-6 flex flex-col items-center gap-5">
          <ProjectReadinessPanel
            panels={panels}
            isGeneratingTTS={isGeneratingTTS}
            onAddScene={handleAddScene}
            onGenerateTTS={handleGenerateProjectTTS}
            onOpenScriptImport={() => setScriptImportOpen(true)}
            onSelectScene={handleSelectScene}
          />
          <VideoPreviewCanvas panel={previewPanel} />
          {previewPanel && (
            <div className="w-full max-w-[520px] rounded bg-white p-4 shadow-sm border border-gray-200">
              <div className="flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-gray-500">
                    현재 씬 #{previewPanel.order_index + 1}
                  </p>
                  <p className="truncate text-sm text-gray-900">{previewPanel.script}</p>
                </div>
                <div className="flex gap-2 text-xs">
                  <span className="rounded bg-gray-100 px-2 py-1 text-gray-600">
                    이미지 {previewPanel.image_status === 'ready' ? '있음' : '없음'}
                  </span>
                  <span className="rounded bg-gray-100 px-2 py-1 text-gray-600">
                    TTS {previewPanel.tts_status === 'completed' ? '완료' : '없음'}
                  </span>
                </div>
              </div>
            </div>
          )}
          {(renderJob || renderError) && (
            <div className="w-full max-w-[520px] rounded border border-gray-200 bg-white p-4 shadow-sm">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-gray-900">
                    렌더 상태: {renderJob?.status || 'failed'}
                  </p>
                  <p className="mt-1 text-xs text-gray-500">
                    진행률 {renderJob?.progress || 0}%
                    {renderError ? ` · ${renderError}` : ''}
                  </p>
                </div>
                {renderJob?.output_url && (
                  <a
                    href={mediaUrl(renderJob.output_url)}
                    download
                    className="rounded bg-gray-900 px-3 py-2 text-sm font-semibold text-white hover:bg-gray-800"
                  >
                    MP4 받기
                  </a>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      <SceneTimeline
        panels={panels}
        selectedPanelId={selectedPanelId}
        playingPanelId={playingPanelId}
        playheadProgress={playheadProgress}
        onSelect={(id) => dispatch(setSelectedPanel(id))}
        onReorderLocal={(nextPanels) => dispatch(reorderPanelsLocally(nextPanels))}
        onReorderCommit={(nextPanels) =>
          dispatch(reorderPanels(nextPanels))
            .unwrap()
            .then(() => undefined)
        }
      />
      <ScriptImportModal
        open={scriptImportOpen}
        onClose={() => setScriptImportOpen(false)}
        onImport={handleImportScripts}
      />
    </div>
  );
}
