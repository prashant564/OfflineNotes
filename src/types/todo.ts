export interface Todo {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  createdAt: string;
  updatedAt: string;
  synced: boolean;
  localOnly?: boolean;
}

export interface TodoState {
  todos: Todo[];
  isLoading: boolean;
  isSyncing: boolean;
  error: string | null;
  lastSyncTime: string | null;
}

export interface CreateTodoRequest {
  title: string;
  description: string;
}

export interface UpdateTodoRequest {
  id: string;
  title?: string;
  description?: string;
  completed?: boolean;
}

export interface ApiTodo {
  id: number;
  userId: number;
  title: string;
  completed: boolean;
}
/* The `const initialState: TodoState = { todos: [], isLoading: false, isSyncing: false, error: null,
lastSyncTime: null };` statement is initializing the initial state for the `todos` slice in Redux. */
/* The `const initialState: TodoState = { todos: [], isLoading: false, isSyncing: false, error: null,
lastSyncTime: null };` statement is initializing the initial state for the `todos` slice of the
Redux store. */
