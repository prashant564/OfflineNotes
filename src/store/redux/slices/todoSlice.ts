import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import {
  Todo,
  TodoState,
  CreateTodoRequest,
  UpdateTodoRequest,
} from '@typings/todo';
import { StorageService } from '@services/storage';
import { NetworkManager } from '@services/networkManager';

const initialState: TodoState = {
  todos: [],
  isLoading: false,
  isSyncing: false,
  error: null,
  lastSyncTime: null,
};

export const loadTodosFromStorage = createAsyncThunk(
  'todos/loadFromStorage',
  async () => {
    const todos = await StorageService.loadTodos();
    const lastSyncTime = await StorageService.getLastSyncTime();
    return { todos, lastSyncTime };
  },
);

export const createTodo = createAsyncThunk<Todo, CreateTodoRequest>(
  'todos/create',
  async (todoData: CreateTodoRequest, { getState }) => {
    const todo: Todo = {
      id: Date.now().toString(),
      title: todoData.title,
      description: todoData.description,
      completed: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      synced: false,
      localOnly: !NetworkManager.isConnected,
    };

    const state = getState() as { todos: TodoState };
    const updatedTodos = [...state.todos.todos, todo];
    await StorageService.saveTodos(updatedTodos);

    return todo;
  },
);

export const updateTodo = createAsyncThunk<Todo, UpdateTodoRequest>(
  'todos/update',
  async (updateData: UpdateTodoRequest, { getState }) => {
    const state = getState() as { todos: TodoState };
    let updatedTodoObj: Todo | null = null;
    const updatedTodos = state.todos.todos.map(todo => {
      if (todo.id === updateData.id) {
        updatedTodoObj = {
          ...todo,
          ...updateData,
          updatedAt: new Date().toISOString(),
          synced: false,
        };
        return updatedTodoObj;
      } else {
        return todo;
      }
    });

    await StorageService.saveTodos(updatedTodos);
    if (updatedTodoObj) {
      return updatedTodoObj;
    } else {
      throw new Error('Todo not found for update');
    }
  },
);

export const deleteTodo = createAsyncThunk(
  'todos/delete',
  async (id: string, { getState }) => {
    const state = getState() as { todos: TodoState };
    const updatedTodos = state.todos.todos.filter(todo => todo.id !== id);
    await StorageService.saveTodos(updatedTodos);
    const deletedTodoIds = (await StorageService.getDeletedTodoIds()) || [];
    if (!deletedTodoIds.includes(id)) {
      deletedTodoIds.push(id);
      await StorageService.saveDeletedTodoIds(deletedTodoIds);
    }
    return id;
  },
);

const todoSlice = createSlice({
  name: 'todos',
  initialState,
  reducers: {
    setSyncStatus: (state, action: PayloadAction<boolean>) => {
      state.isSyncing = action.payload;
    },
    updateSyncTime: (state, action: PayloadAction<string>) => {
      state.lastSyncTime = action.payload;
    },
    markTodoAsSynced: (state, action: PayloadAction<string>) => {
      const todo = state.todos.find(t => t.id === action.payload);
      if (todo) {
        todo.synced = true;
        todo.localOnly = false;
      }
    },
  },
  extraReducers: builder => {
    builder
      // Load todos from storage
      .addCase(loadTodosFromStorage.pending, state => {
        state.isLoading = true;
      })
      .addCase(loadTodosFromStorage.fulfilled, (state, action) => {
        state.isLoading = false;
        state.todos = action.payload.todos;
        state.lastSyncTime = action.payload.lastSyncTime;
      })
      .addCase(loadTodosFromStorage.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to load todos';
      })
      // Create todo
      .addCase(createTodo.fulfilled, (state, action) => {
        state.todos.push(action.payload);
      })
      // Update todo
      .addCase(updateTodo.fulfilled, (state, action) => {
        const updatedTodo = action.payload;
        const index = state.todos.findIndex(todo => todo.id === updatedTodo.id);
        if (index !== -1) {
          state.todos[index] = updatedTodo;
        }
      })
      // Delete todo
      .addCase(deleteTodo.fulfilled, (state, action) => {
        state.todos = state.todos.filter(todo => todo.id !== action.payload);
      });
  },
});

export const { setSyncStatus, updateSyncTime, markTodoAsSynced } =
  todoSlice.actions;
export default todoSlice.reducer;
