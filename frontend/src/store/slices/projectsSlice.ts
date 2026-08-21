import { createAsyncThunk, createSlice, type PayloadAction } from '@reduxjs/toolkit';
import { projectsApi } from '../../api/projects';
import type { CreateProjectDTO, Project, UpdateProjectDTO } from '../../types';

interface ProjectsState {
  projects: Project[];
  currentProject: Project | null;
  loading: boolean;
  error: string | null;
}

const initialState: ProjectsState = {
  projects: [],
  currentProject: null,
  loading: false,
  error: null,
};

export const fetchProjects = createAsyncThunk(
  'projects/fetchAll',
  async (params?: { status?: string; search?: string }) => {
    const response = await projectsApi.getAll(params);
    return response.projects;
  }
);

export const fetchProjectById = createAsyncThunk('projects/fetchById', async (id: string) => {
  return await projectsApi.getById(id);
});

export const createProject = createAsyncThunk(
  'projects/create',
  async (project: CreateProjectDTO) => {
    return await projectsApi.create(project);
  }
);

export const updateProject = createAsyncThunk(
  'projects/update',
  async ({ id, data }: { id: string; data: UpdateProjectDTO }) => {
    return await projectsApi.update(id, data);
  }
);

export const deleteProject = createAsyncThunk('projects/delete', async (id: string) => {
  await projectsApi.delete(id);
  return id;
});

const projectsSlice = createSlice({
  name: 'projects',
  initialState,
  reducers: {
    setCurrentProject: (state, action: PayloadAction<Project | null>) => {
      state.currentProject = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProjects.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProjects.fulfilled, (state, action) => {
        state.loading = false;
        state.projects = action.payload;
      })
      .addCase(fetchProjects.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || '프로젝트 조회 실패';
      })
      .addCase(fetchProjectById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProjectById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentProject = action.payload;
      })
      .addCase(fetchProjectById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || '프로젝트 조회 실패';
      })
      .addCase(createProject.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createProject.fulfilled, (state, action) => {
        state.loading = false;
        state.projects.unshift(action.payload);
        state.currentProject = action.payload;
      })
      .addCase(createProject.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || '프로젝트 생성 실패';
      })
      .addCase(updateProject.fulfilled, (state, action) => {
        const index = state.projects.findIndex((project) => project.id === action.payload.id);
        if (index !== -1) {
          state.projects[index] = action.payload;
        }
        if (state.currentProject?.id === action.payload.id) {
          state.currentProject = action.payload;
        }
      })
      .addCase(deleteProject.fulfilled, (state, action) => {
        state.projects = state.projects.filter((project) => project.id !== action.payload);
        if (state.currentProject?.id === action.payload) {
          state.currentProject = null;
        }
      });
  },
});

export const { setCurrentProject, clearError } = projectsSlice.actions;
export default projectsSlice.reducer;
