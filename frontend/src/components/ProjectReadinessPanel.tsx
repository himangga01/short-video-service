import { AlertTriangle, CheckCircle2, FileText, Film, Image, Mic2, Plus } from 'lucide-react';
import type { Panel } from '../types';

interface ProjectReadinessPanelProps {
  panels: Panel[];
  isGeneratingTTS: boolean;
  onAddScene: () => void;
  onGenerateTTS: () => void;
  onOpenScriptImport: () => void;
  onSelectScene: (id: string) => void;
}

function isImageReady(panel: Panel) {
  return panel.image_status === 'ready' && Boolean(panel.image_url);
}

function isTtsReady(panel: Panel) {
  return panel.tts_status === 'completed' && Boolean(panel.audio_url) && Boolean(panel.tts_hash);
}

function sceneLabel(panel: Panel) {
  return `씬 ${panel.order_index + 1}`;
}

function ReadinessCard({
  label,
  value,
  helper,
  tone,
  icon,
}: {
  label: string;
  value: string;
  helper: string;
  tone: 'ready' | 'warning' | 'neutral';
  icon: React.ReactNode;
}) {
  const toneClass =
    tone === 'ready'
      ? 'border-emerald-200 bg-emerald-50 text-emerald-900'
      : tone === 'warning'
        ? 'border-amber-200 bg-amber-50 text-amber-900'
        : 'border-gray-200 bg-gray-50 text-gray-900';

  return (
    <div className={`rounded-xl border p-3 ${toneClass}`}>
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs font-semibold uppercase tracking-wide opacity-70">{label}</p>
        {icon}
      </div>
      <p className="mt-2 text-xl font-bold">{value}</p>
      <p className="mt-1 text-xs opacity-75">{helper}</p>
    </div>
  );
}

export default function ProjectReadinessPanel({
  panels,
  isGeneratingTTS,
  onAddScene,
  onGenerateTTS,
  onOpenScriptImport,
  onSelectScene,
}: ProjectReadinessPanelProps) {
  const missingScriptPanels = panels.filter((panel) => !panel.script.trim());
  const missingImagePanels = panels.filter((panel) => !isImageReady(panel));
  const missingTtsPanels = panels.filter((panel) => !isTtsReady(panel));
  const readyPanels = panels.filter((panel) => panel.render_ready);
  const exportReady = panels.length > 0 && readyPanels.length === panels.length;

  if (panels.length === 0) {
    return (
      <section className="w-full max-w-[760px] rounded-2xl border border-dashed border-blue-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-blue-600">
              시작하기
            </p>
            <h3 className="mt-1 text-lg font-bold text-gray-950">첫 씬을 만들면 편집이 시작됩니다</h3>
            <p className="mt-1 text-sm text-gray-600">
              긴 대본을 붙여넣어 자동 분할하거나, 빈 씬을 하나씩 추가해도 됩니다.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={onOpenScriptImport}
              className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-3 py-2 text-sm font-semibold text-white hover:bg-blue-700"
            >
              <FileText className="h-4 w-4" />
              대본 붙여넣기
            </button>
            <button
              type="button"
              onClick={onAddScene}
              className="inline-flex items-center gap-2 rounded-lg border border-gray-300 px-3 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
            >
              <Plus className="h-4 w-4" />
              빈 씬 추가
            </button>
          </div>
        </div>
      </section>
    );
  }

  const firstScriptIssue = missingScriptPanels[0];
  const firstImageIssue = missingImagePanels[0];
  const firstTtsIssue = missingTtsPanels[0];

  return (
    <section className="w-full max-w-[760px] rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-blue-600">
            제작 준비도
          </p>
          <h3 className="mt-1 text-lg font-bold text-gray-950">
            {exportReady ? 'Export 준비 완료' : 'Export까지 남은 작업이 있습니다'}
          </h3>
          <p className="mt-1 text-sm text-gray-600">
            이미지와 TTS가 모두 준비된 씬만 최종 영상에 안전하게 들어갑니다.
          </p>
        </div>
        <div
          className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ${
            exportReady ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-800'
          }`}
        >
          {exportReady ? <CheckCircle2 className="h-4 w-4" /> : <AlertTriangle className="h-4 w-4" />}
          {readyPanels.length}/{panels.length} 씬 렌더 준비
        </div>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <ReadinessCard
          label="씬"
          value={`${panels.length}개`}
          helper={missingScriptPanels.length ? '빈 대본 확인 필요' : '대본 준비됨'}
          tone={missingScriptPanels.length ? 'warning' : 'ready'}
          icon={<FileText className="h-4 w-4" />}
        />
        <ReadinessCard
          label="이미지"
          value={`${panels.length - missingImagePanels.length}/${panels.length}`}
          helper={missingImagePanels.length ? `${missingImagePanels.length}개 필요` : '모두 적용됨'}
          tone={missingImagePanels.length ? 'warning' : 'ready'}
          icon={<Image className="h-4 w-4" />}
        />
        <ReadinessCard
          label="TTS"
          value={`${panels.length - missingTtsPanels.length}/${panels.length}`}
          helper={missingTtsPanels.length ? `${missingTtsPanels.length}개 필요` : '모두 생성됨'}
          tone={missingTtsPanels.length ? 'warning' : 'ready'}
          icon={<Mic2 className="h-4 w-4" />}
        />
        <ReadinessCard
          label="Export"
          value={exportReady ? '가능' : '대기'}
          helper={exportReady ? 'MP4 생성 가능' : '누락 항목 수정 필요'}
          tone={exportReady ? 'ready' : 'neutral'}
          icon={<Film className="h-4 w-4" />}
        />
      </div>

      {!exportReady && (
        <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-3">
          <p className="text-sm font-semibold text-amber-950">다음 작업</p>
          <div className="mt-2 flex flex-wrap gap-2 text-sm">
            {firstScriptIssue && (
              <button
                type="button"
                onClick={() => onSelectScene(firstScriptIssue.id)}
                className="rounded-lg bg-white px-3 py-2 text-amber-900 shadow-sm hover:bg-amber-100"
              >
                {sceneLabel(firstScriptIssue)} 대본 확인
              </button>
            )}
            {firstImageIssue && (
              <button
                type="button"
                onClick={() => onSelectScene(firstImageIssue.id)}
                className="rounded-lg bg-white px-3 py-2 text-amber-900 shadow-sm hover:bg-amber-100"
              >
                {sceneLabel(firstImageIssue)} 이미지 추가
              </button>
            )}
            {firstTtsIssue && (
              <button
                type="button"
                onClick={() => onSelectScene(firstTtsIssue.id)}
                className="rounded-lg bg-white px-3 py-2 text-amber-900 shadow-sm hover:bg-amber-100"
              >
                {sceneLabel(firstTtsIssue)} TTS 확인
              </button>
            )}
            {missingTtsPanels.length > 0 && (
              <button
                type="button"
                onClick={onGenerateTTS}
                disabled={isGeneratingTTS}
                className="rounded-lg bg-amber-900 px-3 py-2 font-semibold text-white hover:bg-amber-950 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isGeneratingTTS ? 'TTS 생성 중' : '전체 TTS 생성'}
              </button>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
