import { ImageOff } from 'lucide-react';
import { mediaUrl } from '../api/media';
import type { Panel } from '../types';

interface VideoPreviewCanvasProps {
  panel?: Panel;
}

const positionClass: Record<Panel['subtitle_position'], string> = {
  top: 'items-start pt-10',
  middle: 'items-center',
  bottom: 'items-end pb-12',
};

export default function VideoPreviewCanvas({ panel }: VideoPreviewCanvasProps) {
  if (!panel) {
    return (
      <div
        className="w-full max-w-[360px] bg-gray-900 rounded-lg flex items-center justify-center text-gray-400 border border-gray-800"
        style={{ aspectRatio: '9 / 16' }}
      >
        <div className="text-center px-8">
          <ImageOff className="w-10 h-10 mx-auto mb-3 text-gray-600" />
          <p className="text-sm">씬을 선택하면 프리뷰가 표시됩니다</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="relative w-full max-w-[360px] overflow-hidden rounded-lg border border-gray-800 shadow-2xl bg-black"
      style={{ aspectRatio: '9 / 16', backgroundColor: panel.background_color }}
    >
      {panel.image_url ? (
        <img
          src={mediaUrl(panel.image_url)}
          alt="씬 프리뷰"
          className="absolute inset-0 h-full w-full object-cover"
        />
      ) : (
        <div className="absolute inset-0 grid place-items-center bg-[radial-gradient(circle_at_center,#374151,#111827_65%)]">
          <div className="text-center text-gray-300 px-8">
            <ImageOff className="w-10 h-10 mx-auto mb-3 text-gray-500" />
            <p className="text-sm">이미지 없음</p>
          </div>
        </div>
      )}

      <div className={`absolute inset-0 flex justify-center px-6 ${positionClass[panel.subtitle_position]}`}>
        <div
          className="max-w-full rounded px-3 py-2 text-center font-bold leading-snug shadow-lg"
          style={{
            color: panel.text_color,
            backgroundColor: `${panel.background_color}CC`,
            fontSize: `${Math.min(Math.max(panel.text_size, 14), 42)}px`,
          }}
        >
          {panel.script}
        </div>
      </div>

      <div className="absolute inset-x-4 top-4 flex justify-between text-[10px] text-white/70">
        <span>9:16</span>
        <span>{panel.render_ready ? '렌더 준비됨' : '렌더 준비 전'}</span>
      </div>
    </div>
  );
}
