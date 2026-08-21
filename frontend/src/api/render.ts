import apiClient from './client';
import type { RenderJob } from '../types';

export const renderApi = {
  renderProject: async (projectId: string) => {
    const { data } = await apiClient.post<RenderJob>(`/api/render/project/${projectId}`);
    return data;
  },

  getJob: async (jobId: string) => {
    const { data } = await apiClient.get<RenderJob>(`/api/render/jobs/${jobId}`);
    return data;
  },
};
