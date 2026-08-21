import { useEffect, useState } from 'react';
import { Folder, Plus, Search } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { createProject, fetchProjectById, fetchProjects } from '../store/slices/projectsSlice';
import { fetchPanelsByProject } from '../store/slices/panelsSlice';
import type { Project } from '../types';

const statusLabels: Record<Project['status'], string> = {
  draft: '초안',
  in_progress: '진행 중',
  completed: '완료',
};

export default function ProjectList() {
  const dispatch = useAppDispatch();
  const { projects, loading, currentProject } = useAppSelector((state) => state.projects);
  const [search, setSearch] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newProjectTitle, setNewProjectTitle] = useState('');

  useEffect(() => {
    dispatch(fetchProjects());
  }, [dispatch]);

  const handleCreateProject = async () => {
    const title = newProjectTitle.trim();
    if (!title) return;

    const result = await dispatch(createProject({ title }));
    if (createProject.fulfilled.match(result)) {
      setNewProjectTitle('');
      setShowCreateModal(false);
      dispatch(fetchProjectById(result.payload.id));
      dispatch(fetchPanelsByProject(result.payload.id));
    }
  };

  const handleSelectProject = (projectId: string) => {
    dispatch(fetchProjectById(projectId));
    dispatch(fetchPanelsByProject(projectId));
  };

  const filteredProjects = projects.filter((project) =>
    project.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b border-gray-200">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="프로젝트 검색..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <div className="p-4 border-b border-gray-200">
        <button
          type="button"
          onClick={() => setShowCreateModal(true)}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors"
        >
          <Plus className="w-5 h-5" />
          새 프로젝트
        </button>
      </div>

      <div className="flex-1 overflow-y-auto">
        {loading && projects.length === 0 ? (
          <div className="p-4 text-center text-gray-500">불러오는 중...</div>
        ) : filteredProjects.length === 0 ? (
          <div className="p-4 text-center text-gray-500">
            {search ? '검색 결과가 없습니다' : '프로젝트가 없습니다'}
          </div>
        ) : (
          <div className="space-y-1 p-2">
            {filteredProjects.map((project) => (
              <button
                type="button"
                key={project.id}
                onClick={() => handleSelectProject(project.id)}
                className={`w-full text-left p-3 rounded-lg transition-colors ${
                  currentProject?.id === project.id
                    ? 'bg-blue-50 border border-blue-200'
                    : 'hover:bg-gray-100'
                }`}
              >
                <div className="flex items-start gap-2">
                  <Folder className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-gray-900 truncate">{project.title}</h3>
                    {project.description && (
                      <p className="text-sm text-gray-500 truncate mt-0.5">
                        {project.description}
                      </p>
                    )}
                    <div className="flex items-center gap-2 mt-1">
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full ${
                          project.status === 'completed'
                            ? 'bg-green-100 text-green-700'
                            : project.status === 'in_progress'
                              ? 'bg-yellow-100 text-yellow-700'
                              : 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        {statusLabels[project.status]}
                      </span>
                      <span className="text-xs text-gray-400">
                        {new Date(project.updated_at).toLocaleDateString('ko-KR')}
                      </span>
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96">
            <h2 className="text-lg font-bold mb-4">새 프로젝트 만들기</h2>
            <input
              type="text"
              placeholder="프로젝트 제목"
              value={newProjectTitle}
              onChange={(event) => setNewProjectTitle(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  handleCreateProject();
                }
              }}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
              autoFocus
            />
            <div className="flex gap-2 justify-end">
              <button
                type="button"
                onClick={() => {
                  setShowCreateModal(false);
                  setNewProjectTitle('');
                }}
                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                취소
              </button>
              <button
                type="button"
                onClick={handleCreateProject}
                disabled={!newProjectTitle.trim()}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                생성
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
