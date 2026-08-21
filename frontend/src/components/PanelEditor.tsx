import { useState } from 'react';
import { closestCenter, DndContext, KeyboardSensor, PointerSensor, useSensor, useSensors, type DragEndEvent } from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Edit, GripVertical, Plus, Trash2 } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import {
  createPanel,
  deletePanel,
  reorderPanels,
  reorderPanelsLocally,
  setSelectedPanel,
  updatePanel,
} from '../store/slices/panelsSlice';
import type { Panel } from '../types';

interface SortablePanelProps {
  panel: Panel;
  index: number;
  selectedPanelId: string | null;
  editingPanelId: string | null;
  editScript: string;
  onSelect: (id: string) => void;
  onStartEdit: (id: string, script: string) => void;
  onSaveEdit: () => void;
  onCancelEdit: () => void;
  onDelete: (id: string) => void;
  onEditScriptChange: (value: string) => void;
}

function SortablePanel({
  panel,
  index,
  selectedPanelId,
  editingPanelId,
  editScript,
  onSelect,
  onStartEdit,
  onSaveEdit,
  onCancelEdit,
  onDelete,
  onEditScriptChange,
}: SortablePanelProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: panel.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      onClick={() => onSelect(panel.id)}
      className={`bg-white border rounded-lg p-4 cursor-pointer transition-all ${
        selectedPanelId === panel.id
          ? 'border-blue-500 shadow-md'
          : 'border-gray-200 hover:border-gray-300'
      }`}
    >
      <div className="flex items-start gap-3">
        <button
          type="button"
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing"
          aria-label={`${index + 1}번 씬 순서 변경`}
        >
          <GripVertical className="w-5 h-5 text-gray-400 mt-1 flex-shrink-0" />
        </button>

        <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold flex-shrink-0">
          {index + 1}
        </div>

        <div className="flex-1 min-w-0">
          {editingPanelId === panel.id ? (
            <div className="space-y-2">
              <textarea
                value={editScript}
                onChange={(event) => onEditScriptChange(event.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={3}
                autoFocus
              />
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={onSaveEdit}
                  className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded transition-colors"
                >
                  저장
                </button>
                <button
                  type="button"
                  onClick={onCancelEdit}
                  className="px-3 py-1 bg-gray-200 hover:bg-gray-300 text-gray-700 text-sm rounded transition-colors"
                >
                  취소
                </button>
              </div>
            </div>
          ) : (
            <>
              <p className="text-gray-900 whitespace-pre-wrap break-words">{panel.script}</p>
              {panel.image_url && (
                <div className="mt-2">
                  <img
                    src={panel.image_url}
                    alt="씬 이미지"
                    className="max-w-full h-auto rounded border border-gray-200"
                  />
                </div>
              )}
            </>
          )}
        </div>

        {editingPanelId !== panel.id && (
          <div className="flex gap-1 flex-shrink-0">
            <button
              type="button"
              aria-label={`${index + 1}번 씬 편집`}
              onClick={(event) => {
                event.stopPropagation();
                onStartEdit(panel.id, panel.script);
              }}
              className="p-2 text-gray-600 hover:bg-gray-100 rounded transition-colors"
            >
              <Edit className="w-4 h-4" />
            </button>
            <button
              type="button"
              aria-label={`${index + 1}번 씬 삭제`}
              onClick={(event) => {
                event.stopPropagation();
                onDelete(panel.id);
              }}
              className="p-2 text-red-600 hover:bg-red-50 rounded transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function PanelEditor() {
  const dispatch = useAppDispatch();
  const { panels, selectedPanelId } = useAppSelector((state) => state.panels);
  const { currentProject } = useAppSelector((state) => state.projects);
  const [editingPanelId, setEditingPanelId] = useState<string | null>(null);
  const [editScript, setEditScript] = useState('');

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleAddPanel = async () => {
    if (!currentProject) return;

    await dispatch(
      createPanel({
        project_id: currentProject.id,
        script: '새 씬 대본을 입력하세요.',
      })
    );
  };

  const handleDeletePanel = async (panelId: string) => {
    if (confirm('이 씬을 삭제할까요?')) {
      await dispatch(deletePanel(panelId));
    }
  };

  const handleStartEdit = (panelId: string, script: string) => {
    setEditingPanelId(panelId);
    setEditScript(script);
  };

  const handleSaveEdit = async () => {
    if (!editingPanelId || !editScript.trim()) return;

    await dispatch(
      updatePanel({
        id: editingPanelId,
        data: { script: editScript },
      })
    );
    setEditingPanelId(null);
    setEditScript('');
  };

  const handleCancelEdit = () => {
    setEditingPanelId(null);
    setEditScript('');
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = panels.findIndex((panel) => panel.id === active.id);
      const newIndex = panels.findIndex((panel) => panel.id === over.id);
      const newPanels = arrayMove(panels, oldIndex, newIndex);

      dispatch(reorderPanelsLocally(newPanels));
      dispatch(
        reorderPanels(
          newPanels.map((panel, index) => ({
            id: panel.id,
            order_index: index,
          }))
        )
      );
    }
  };

  if (!currentProject) {
    return (
      <div className="h-full flex items-center justify-center text-gray-500">
        <div className="text-center">
          <p className="text-lg">프로젝트를 선택해주세요</p>
          <p className="text-sm mt-2">왼쪽에서 프로젝트를 선택하거나 새로 만들어주세요</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b border-gray-200 bg-white">
        <h2 className="text-lg font-bold text-gray-900">{currentProject.title}</h2>
        <p className="text-sm text-gray-500 mt-1">씬 {panels.length}개</p>
      </div>

      <div className="p-4 border-b border-gray-200 bg-white">
        <button
          type="button"
          onClick={handleAddPanel}
          className="w-full bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors"
        >
          <Plus className="w-5 h-5" />
          씬 추가
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {panels.length === 0 ? (
          <div className="text-center text-gray-500 mt-8">
            <p>씬이 없습니다</p>
            <p className="text-sm mt-2">씬 추가 버튼을 눌러 첫 장면을 만들어주세요</p>
          </div>
        ) : (
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={panels.map((panel) => panel.id)} strategy={verticalListSortingStrategy}>
              <div className="space-y-3">
                {panels.map((panel, index) => (
                  <SortablePanel
                    key={panel.id}
                    panel={panel}
                    index={index}
                    selectedPanelId={selectedPanelId}
                    editingPanelId={editingPanelId}
                    editScript={editScript}
                    onSelect={(id) => dispatch(setSelectedPanel(id))}
                    onStartEdit={handleStartEdit}
                    onSaveEdit={handleSaveEdit}
                    onCancelEdit={handleCancelEdit}
                    onDelete={handleDeletePanel}
                    onEditScriptChange={setEditScript}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        )}
      </div>
    </div>
  );
}
