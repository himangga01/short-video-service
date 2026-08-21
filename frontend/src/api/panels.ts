import apiClient from './client';
import type {
  Panel,
  CreatePanelDTO,
  UpdatePanelDTO,
  ReorderPanelDTO,
  TtsBatchResult,
} from '../types';

export const panelsApi = {
  getByProject: async (projectId: string) => {
    const { data } = await apiClient.get<{ panels: Panel[] }>(`/api/panels/project/${projectId}`);
    return data.panels;
  },

  getById: async (id: string) => {
    const { data } = await apiClient.get<Panel>(`/api/panels/${id}`);
    return data;
  },

  create: async (panel: CreatePanelDTO) => {
    const { data } = await apiClient.post<Panel>('/api/panels', panel);
    return data;
  },

  update: async (id: string, panel: UpdatePanelDTO) => {
    const { data } = await apiClient.put<Panel>(`/api/panels/${id}`, panel);
    return data;
  },

  delete: async (id: string) => {
    const { data } = await apiClient.delete<{ message: string; id: string }>(`/api/panels/${id}`);
    return data;
  },

  reorder: async (panels: ReorderPanelDTO[]) => {
    const { data } = await apiClient.put<{ message: string }>('/api/panels/reorder', { panels });
    return data;
  },

  uploadImage: async (id: string, file: File) => {
    const formData = new FormData();
    formData.append('image', file);

    const { data } = await apiClient.post<Panel>(`/api/panels/${id}/image`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return data;
  },

  deleteImage: async (id: string) => {
    const { data } = await apiClient.delete<Panel>(`/api/panels/${id}/image`);
    return data;
  },

  generateTTS: async (id: string, instructions?: string | null) => {
    const { data } = await apiClient.post<Panel>(`/api/panels/${id}/tts`, { instructions });
    return data;
  },

  generateProjectTTS: async (projectId: string, instructions?: string | null) => {
    const { data } = await apiClient.post<TtsBatchResult>(`/api/panels/project/${projectId}/tts`, {
      instructions,
    });
    return data;
  },
};

