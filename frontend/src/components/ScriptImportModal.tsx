import { useMemo, useState } from 'react';
import { X } from 'lucide-react';

interface ScriptImportModalProps {
  open: boolean;
  onClose: () => void;
  onImport: (scripts: string[]) => void;
}

function splitScript(rawScript: string) {
  const normalized = rawScript.replace(/\r\n/g, '\n').trim();
  if (!normalized) return [];

  const paragraphScenes = normalized
    .split(/\n{2,}/)
    .map((scene) => scene.trim())
    .filter(Boolean);

  if (paragraphScenes.length > 1) {
    return paragraphScenes;
  }

  return (
    normalized
      .match(/[^.!?。！？…]+[.!?。！？…]?/g)
      ?.map((scene) => scene.trim())
      .filter(Boolean) || []
  );
}

export default function ScriptImportModal({ open, onClose, onImport }: ScriptImportModalProps) {
  const [script, setScript] = useState('');
  const scenes = useMemo(() => splitScript(script), [script]);

  if (!open) return null;

  const handleImport = () => {
    if (scenes.length === 0) return;
    onImport(scenes);
    setScript('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 px-4">
      <div className="w-full max-w-2xl rounded-2xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4">
          <div>
            <h2 className="text-lg font-bold text-gray-900">대본 붙여넣기</h2>
            <p className="text-sm text-gray-500">
              빈 줄 기준으로 씬을 나누고, 빈 줄이 없으면 문장 단위로 나눕니다.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 text-gray-500 hover:bg-gray-100"
            aria-label="대본 붙여넣기 닫기"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-4 p-5">
          <textarea
            value={script}
            onChange={(event) => setScript(event.target.value)}
            rows={12}
            placeholder="예: 첫 번째 썰 도입부...\n\n두 번째 장면에서 반전이 드러납니다..."
            className="w-full resize-none rounded-xl border border-gray-300 px-4 py-3 text-sm leading-6 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          <div className="rounded-lg bg-gray-50 px-4 py-3 text-sm text-gray-700">
            예상 생성 씬: <strong>{scenes.length}</strong>개
          </div>
        </div>

        <div className="flex justify-end gap-2 border-t border-gray-200 px-5 py-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            취소
          </button>
          <button
            type="button"
            onClick={handleImport}
            disabled={scenes.length === 0}
            className="rounded bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            씬으로 추가
          </button>
        </div>
      </div>
    </div>
  );
}
