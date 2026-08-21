import { closestCenter, DndContext, KeyboardSensor, PointerSensor, useSensor, useSensors, type DragEndEvent } from '@dnd-kit/core';
import {
  arrayMove,
  horizontalListSortingStrategy,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Image, Mic, Play } from 'lucide-react';
import type { Panel, ReorderPanelDTO } from '../types';

interface SceneTimelineProps {
  panels: Panel[];
  selectedPanelId: string | null;
  playingPanelId: string | null;
  playheadProgress: number;
  onSelect: (id: string) => void;
  onReorderLocal: (panels: Panel[]) => void;
  onReorderCommit: (panels: ReorderPanelDTO[]) => Promise<void> | void;
}

function formatMs(ms?: number | null) {
  if (!ms) return '--:--';
  const seconds = Math.round(ms / 1000);
  return `${Math.floor(seconds / 60)}:${(seconds % 60).toString().padStart(2, '0')}`;
}

function statusLabel(panel: Panel) {
  if (panel.tts_status === 'completed') return 'TTS 완료';
  if (panel.tts_status === 'processing' || panel.tts_status === 'queued') return 'TTS 생성 중';
  if (panel.tts_status === 'failed') return 'TTS 실패';
  return 'TTS 없음';
}

interface SortableSceneCardProps {
  panel: Panel;
  index: number;
  selected: boolean;
  playing: boolean;
  onSelect: (id: string) => void;
}

function SortableSceneCard({ panel, index, selected, playing, onSelect }: SortableSceneCardProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: panel.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.6 : 1,
  };

  return (
    <button
      type="button"
      ref={setNodeRef}
      style={style}
      onClick={() => onSelect(panel.id)}
      className={`relative min-w-64 max-w-64 text-left rounded border bg-white p-3 transition ${
        selected ? 'border-blue-500 shadow-md' : 'border-gray-200 hover:border-gray-300'
      } ${playing ? 'ring-2 ring-green-400' : ''}`}
    >
      <div className="flex items-start gap-2">
        <span
          {...attributes}
          {...listeners}
          className="mt-0.5 cursor-grab rounded p-1 text-gray-400 hover:bg-gray-100"
          aria-label={`${index + 1}번 씬 이동`}
        >
          <GripVertical className="h-4 w-4" />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <span className="rounded bg-blue-50 px-2 py-0.5 text-xs font-semibold text-blue-700">
              씬 {index + 1}
            </span>
            <span className="text-xs text-gray-500">{formatMs(panel.audio_duration_ms)}</span>
          </div>
          <p className="mt-2 line-clamp-2 text-sm font-medium text-gray-900">{panel.script}</p>
          <div className="mt-3 flex items-center gap-2 text-xs text-gray-500">
            <span className="inline-flex items-center gap-1">
              <Image className="h-3.5 w-3.5" />
              {panel.image_status === 'ready' ? '이미지' : '없음'}
            </span>
            <span className="inline-flex items-center gap-1">
              <Mic className="h-3.5 w-3.5" />
              {statusLabel(panel)}
            </span>
          </div>
        </div>
      </div>
      {playing && (
        <span className="absolute right-2 top-2 rounded-full bg-green-500 p-1 text-white">
          <Play className="h-3 w-3" />
        </span>
      )}
    </button>
  );
}

export default function SceneTimeline({
  panels,
  selectedPanelId,
  playingPanelId,
  playheadProgress,
  onSelect,
  onReorderLocal,
  onReorderCommit,
}: SceneTimelineProps) {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || active.id === over.id) return;

    const oldIndex = panels.findIndex((panel) => panel.id === active.id);
    const newIndex = panels.findIndex((panel) => panel.id === over.id);
    if (oldIndex === -1 || newIndex === -1) return;

    const previousPanels = panels;
    const nextPanels = arrayMove(panels, oldIndex, newIndex);

    onReorderLocal(nextPanels);
    try {
      await onReorderCommit(
        nextPanels.map((panel, index) => ({ id: panel.id, order_index: index }))
      );
    } catch {
      onReorderLocal(previousPanels);
    }
  };

  return (
    <div className="border-t border-gray-200 bg-white p-4">
      <div className="mb-3 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-gray-900">씬 타임라인</h3>
          <p className="text-xs text-gray-500">드래그해서 장면 순서를 조정합니다</p>
        </div>
        <div className="h-2 w-40 overflow-hidden rounded-full bg-gray-100">
          <div className="h-full bg-blue-500 transition-all" style={{ width: `${playheadProgress}%` }} />
        </div>
      </div>

      {panels.length === 0 ? (
        <div className="rounded border border-dashed border-gray-300 p-8 text-center text-sm text-gray-500">
          씬을 추가하면 타임라인이 표시됩니다
        </div>
      ) : (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={panels.map((panel) => panel.id)} strategy={horizontalListSortingStrategy}>
            <div className="flex gap-3 overflow-x-auto pb-2">
              {panels.map((panel, index) => (
                <SortableSceneCard
                  key={panel.id}
                  panel={panel}
                  index={index}
                  selected={selectedPanelId === panel.id}
                  playing={playingPanelId === panel.id}
                  onSelect={onSelect}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}
    </div>
  );
}
