import { configureStore } from '@reduxjs/toolkit';
import { todoApi } from './api/todoApi';
import todoSlice from './slices/todoSlice';

export const store = configureStore({
  reducer: {
    todos: todoSlice,
    [todoApi.reducerPath]: todoApi.reducer,
  },
  middleware: getDefaultMiddleware =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [todoApi.util.getRunningQueriesThunk.toString()],
      },
    }).concat(todoApi.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
