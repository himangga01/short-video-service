import {
  AlertTriangle,
  Download,
  FileText,
  Loader2,
  Mic2,
  Play,
  Plus,
  RefreshCw,
  Save,
} from 'lucide-react';

export type SaveStatus = 'idle' | 'saving' | 'saved' | 'failed';

interface EditorToolbarProps {
  projectTitle?: string;
  totalDurationMs: number;
  sceneCount: number;
  canPreview: boolean;
  canGenerateTTS: boolean;
  canExport: boolean;
  exportDisabledReason?: string;
  isGeneratingTTS: boolean;
  isRendering: boolean;
  isPlaying: boolean;
  saveStatus?: SaveStatus;
  saveError?: string | null;
  onAddScene: () => void;
  onExport: () => void;
  onGenerateTTS: () => void;
  onOpenScriptImport: () => void;
  onTogglePlayback: () => void;
}

function formatDuration(ms: number) {
  const totalSeconds = Math.max(0, Math.round(ms / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

export default function EditorToolbar({
  projectTitle,
  totalDurationMs,
  sceneCount,
  canPreview,
  canGenerateTTS,
  canExport,
  exportDisabledReason,
  isGeneratingTTS,
  isRendering,
  isPlaying,
  saveStatus = 'saved',
  saveError,
  onAddScene,
  onExport,
  onGenerateTTS,
  onOpenScriptImport,
  onTogglePlayback,
}: EditorToolbarProps) {
  const saveMeta =
    saveStatus === 'saving'
      ? {
          label: '저장 중',
          className: 'bg-amber-50 text-amber-700',
          icon: <Loader2 className="h-3 w-3 animate-spin" />,
        }
      : saveStatus === 'failed'
        ? {
            label: '저장 실패',
            className: 'bg-red-50 text-red-700',
            icon: <AlertTriangle className="h-3 w-3" />,
          }
        : {
            label: '저장됨',
            className: 'bg-green-50 text-green-700',
            icon: <Save className="h-3 w-3" />,
          };

  return (
    <div className="h-16 px-5 border-b border-gray-200 bg-white flex items-center justify-between gap-4">
      <div className="min-w-0">
        <p className="text-xs font-medium text-gray-500">편집 작업대</p>
        <h2 className="text-lg font-semibold text-gray-900 truncate">
          {projectTitle || '프로젝트를 선택해주세요'}
        </h2>
      </div>

      <div className="flex items-center gap-2 text-sm text-gray-600">
        <span className="px-2 py-1 bg-gray-100 rounded">씬 {sceneCount}개</span>
        <span className="px-2 py-1 bg-gray-100 rounded">전체 {formatDuration(totalDurationMs)}</span>
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onAddScene}
          disabled={!projectTitle}
          className="inline-flex items-center gap-2 px-3 py-2 rounded bg-green-600 text-white text-sm font-medium hover:bg-green-700 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <Plus className="w-4 h-4" />
          씬 추가
        </button>
        <button
          type="button"
          onClick={onOpenScriptImport}
          disabled={!projectTitle}
          className="inline-flex items-center gap-2 px-3 py-2 rounded border border-gray-300 text-gray-700 text-sm font-medium hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <FileText className="w-4 h-4" />
          대본 붙여넣기
        </button>
        <button
          type="button"
          onClick={onGenerateTTS}
          disabled={!canGenerateTTS || isGeneratingTTS}
          className="inline-flex items-center gap-2 px-3 py-2 rounded bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {isGeneratingTTS ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Mic2 className="w-4 h-4" />
          )}
          전체 TTS
        </button>
        <button
          type="button"
          onClick={onTogglePlayback}
          disabled={!canPreview}
          className="inline-flex items-center gap-2 px-3 py-2 rounded bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {isPlaying ? <RefreshCw className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          {isPlaying ? '재생 중지' : '전체 재생'}
        </button>
        <button
          type="button"
          onClick={onExport}
          disabled={!canExport || isRendering}
          className="inline-flex items-center gap-2 px-3 py-2 rounded border border-gray-300 text-gray-700 text-sm font-medium hover:bg-gray-50 disabled:text-gray-400 disabled:cursor-not-allowed disabled:opacity-50"
          title={canExport ? 'MP4 렌더링을 시작합니다' : exportDisabledReason}
        >
          {isRendering ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Download className="w-4 h-4" />
          )}
          {isRendering ? '렌더링 중' : 'Export'}
        </button>
        {projectTitle && (
          <div
            className={`inline-flex items-center gap-1 rounded px-2 py-1 text-xs ${saveMeta.className}`}
            title={saveError || saveMeta.label}
          >
            {saveMeta.icon}
            {saveMeta.label}
          </div>
        )}
      </div>
    </div>
  );
}
