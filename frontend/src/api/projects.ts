import apiClient from './client';
import type { Project, CreateProjectDTO, UpdateProjectDTO } from '../types';

export const projectsApi = {
  getAll: async (params?: { status?: string; search?: string; limit?: number; offset?: number }) => {
    const { data } = await apiClient.get<{ projects: Project[]; total: number }>('/api/projects', { params });
    return data;
  },

  getById: async (id: string) => {
    const { data } = await apiClient.get<Project>(`/api/projects/${id}`);
    return data;
  },

  create: async (project: CreateProjectDTO) => {
    const { data } = await apiClient.post<Project>('/api/projects', project);
    return data;
  },

  update: async (id: string, project: UpdateProjectDTO) => {
    const { data } = await apiClient.put<Project>(`/api/projects/${id}`, project);
    return data;
  },

  delete: async (id: string) => {
    const { data } = await apiClient.delete<{ message: string; id: string }>(`/api/projects/${id}`);
    return data;
  },
};

