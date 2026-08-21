import { createAsyncThunk, createSlice, type PayloadAction } from '@reduxjs/toolkit';
import { panelsApi } from '../../api/panels';
import type {
  CreatePanelDTO,
  Panel,
  ReorderPanelDTO,
  TtsBatchResult,
  UpdatePanelDTO,
} from '../../types';

interface PanelsState {
  panels: Panel[];
  selectedPanelId: string | null;
  loading: boolean;
  error: string | null;
  saving: boolean;
  saveError: string | null;
}

const initialState: PanelsState = {
  panels: [],
  selectedPanelId: null,
  loading: false,
  error: null,
  saving: false,
  saveError: null,
};

function getApiErrorMessage(error: unknown, fallback: string) {
  if (typeof error === 'object' && error !== null && 'response' in error) {
    const response = (error as { response?: { data?: { error?: string; message?: string } } })
      .response;
    return response?.data?.error || response?.data?.message || fallback;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return fallback;
}

export const fetchPanelsByProject = createAsyncThunk(
  'panels/fetchByProject',
  async (projectId: string) => {
    return await panelsApi.getByProject(projectId);
  }
);

export const createPanel = createAsyncThunk('panels/create', async (panel: CreatePanelDTO) => {
  return await panelsApi.create(panel);
});

export const updatePanel = createAsyncThunk(
  'panels/update',
  async ({ id, data }: { id: string; data: UpdatePanelDTO }) => {
    return await panelsApi.update(id, data);
  }
);

export const deletePanel = createAsyncThunk('panels/delete', async (id: string) => {
  await panelsApi.delete(id);
  return id;
});

export const reorderPanels = createAsyncThunk(
  'panels/reorder',
  async (panels: ReorderPanelDTO[]) => {
    await panelsApi.reorder(panels);
    return panels;
  }
);

export const uploadPanelImage = createAsyncThunk(
  'panels/uploadImage',
  async ({ id, file }: { id: string; file: File }) => {
    return await panelsApi.uploadImage(id, file);
  }
);

export const deletePanelImage = createAsyncThunk('panels/deleteImage', async (id: string) => {
  return await panelsApi.deleteImage(id);
});

export const generatePanelTTS = createAsyncThunk<
  Panel,
  { id: string; instructions?: string | null },
  { rejectValue: string }
>('panels/generateTTS', async ({ id, instructions }, { rejectWithValue }) => {
  try {
    return await panelsApi.generateTTS(id, instructions);
  } catch (error) {
    return rejectWithValue(getApiErrorMessage(error, 'TTS 생성에 실패했습니다.'));
  }
});

export const generateProjectTTS = createAsyncThunk<
  TtsBatchResult,
  { projectId: string; instructions?: string | null },
  { rejectValue: string }
>('panels/generateProjectTTS', async ({ projectId, instructions }, { rejectWithValue }) => {
  try {
    return await panelsApi.generateProjectTTS(projectId, instructions);
  } catch (error) {
    return rejectWithValue(getApiErrorMessage(error, '프로젝트 TTS 생성에 실패했습니다.'));
  }
});

const panelsSlice = createSlice({
  name: 'panels',
  initialState,
  reducers: {
    setSelectedPanel: (state, action: PayloadAction<string | null>) => {
      state.selectedPanelId = action.payload;
    },
    clearPanels: (state) => {
      state.panels = [];
      state.selectedPanelId = null;
    },
    clearError: (state) => {
      state.error = null;
      state.saveError = null;
    },
    reorderPanelsLocally: (state, action: PayloadAction<Panel[]>) => {
      state.panels = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPanelsByProject.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPanelsByProject.fulfilled, (state, action) => {
        state.loading = false;
        state.panels = action.payload;
      })
      .addCase(fetchPanelsByProject.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || '씬 조회 실패';
      })
      .addCase(createPanel.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createPanel.fulfilled, (state, action) => {
        state.loading = false;
        state.panels.push(action.payload);
        state.panels.sort((a, b) => a.order_index - b.order_index);
      })
      .addCase(createPanel.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || '씬 생성 실패';
      })
      .addCase(updatePanel.pending, (state) => {
        state.saving = true;
        state.saveError = null;
      })
      .addCase(updatePanel.fulfilled, (state, action) => {
        state.saving = false;
        state.saveError = null;
        const index = state.panels.findIndex((panel) => panel.id === action.payload.id);
        if (index !== -1) {
          state.panels[index] = action.payload;
        }
      })
      .addCase(updatePanel.rejected, (state, action) => {
        state.saving = false;
        state.saveError = action.error.message || '씬 저장에 실패했습니다.';
        state.error = state.saveError;
      })
      .addCase(uploadPanelImage.pending, (state, action) => {
        const panel = state.panels.find((item) => item.id === action.meta.arg.id);
        if (panel) {
          panel.image_status = 'uploading';
          panel.image_error = undefined;
        }
      })
      .addCase(uploadPanelImage.fulfilled, (state, action) => {
        const index = state.panels.findIndex((panel) => panel.id === action.payload.id);
        if (index !== -1) {
          state.panels[index] = action.payload;
        }
      })
      .addCase(uploadPanelImage.rejected, (state, action) => {
        const panel = state.panels.find((item) => item.id === action.meta.arg.id);
        if (panel) {
          panel.image_status = 'failed';
          panel.image_error = action.error.message || '이미지 업로드 실패';
        }
      })
      .addCase(deletePanelImage.fulfilled, (state, action) => {
        const index = state.panels.findIndex((panel) => panel.id === action.payload.id);
        if (index !== -1) {
          state.panels[index] = action.payload;
        }
      })
      .addCase(generatePanelTTS.pending, (state, action) => {
        const panel = state.panels.find((item) => item.id === action.meta.arg.id);
        if (panel) {
          panel.tts_status = 'processing';
          panel.tts_error = null;
        }
      })
      .addCase(generatePanelTTS.fulfilled, (state, action) => {
        const index = state.panels.findIndex((panel) => panel.id === action.payload.id);
        if (index !== -1) {
          state.panels[index] = action.payload;
        }
      })
      .addCase(generatePanelTTS.rejected, (state, action) => {
        const panel = state.panels.find((item) => item.id === action.meta.arg.id);
        const message = action.payload || action.error.message || 'TTS 생성에 실패했습니다.';
        if (panel) {
          panel.tts_status = 'failed';
          panel.tts_error = message;
        }
        state.error = message;
      })
      .addCase(generateProjectTTS.pending, (state) => {
        state.error = null;
        state.panels.forEach((panel) => {
          if (panel.script.trim()) {
            panel.tts_status = 'queued';
            panel.tts_error = null;
          }
        });
      })
      .addCase(generateProjectTTS.fulfilled, (state, action) => {
        action.payload.panels.forEach((updatedPanel) => {
          const index = state.panels.findIndex((panel) => panel.id === updatedPanel.id);
          if (index !== -1) {
            state.panels[index] = updatedPanel;
          }
        });

        if (action.payload.errors.length > 0) {
          state.error = `${action.payload.errors.length}개 씬의 TTS 생성에 실패했습니다.`;
        }
      })
      .addCase(generateProjectTTS.rejected, (state, action) => {
        const message = action.payload || action.error.message || '프로젝트 TTS 생성에 실패했습니다.';
        state.error = message;
        state.panels.forEach((panel) => {
          if (panel.tts_status === 'queued') {
            panel.tts_status = 'failed';
            panel.tts_error = message;
          }
        });
      })
      .addCase(deletePanel.fulfilled, (state, action) => {
        state.panels = state.panels.filter((panel) => panel.id !== action.payload);
        if (state.selectedPanelId === action.payload) {
          state.selectedPanelId = null;
        }
      })
      .addCase(reorderPanels.fulfilled, (state, action) => {
        action.payload.forEach(({ id, order_index }) => {
          const panel = state.panels.find((item) => item.id === id);
          if (panel) {
            panel.order_index = order_index;
          }
        });
        state.panels.sort((a, b) => a.order_index - b.order_index);
      })
      .addCase(reorderPanels.rejected, (state, action) => {
        state.error = action.error.message || '씬 순서 변경에 실패했습니다.';
      });
  },
});

export const { setSelectedPanel, clearPanels, clearError, reorderPanelsLocally } =
  panelsSlice.actions;
export default panelsSlice.reducer;
