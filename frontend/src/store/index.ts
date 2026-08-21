import { configureStore } from '@reduxjs/toolkit';
import projectsReducer from './slices/projectsSlice';
import panelsReducer from './slices/panelsSlice';

export const store = configureStore({
  reducer: {
    projects: projectsReducer,
    panels: panelsReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

