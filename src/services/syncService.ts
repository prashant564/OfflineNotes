import { Todo, ApiTodo } from '../types/todo';
import { AppDispatch } from '../store/redux/store';
import { todoApi } from '../store/redux/api/todoApi';
import { StorageService } from './storage';
import { NetworkManager } from './networkManager';

export class SyncService {
  /**
   * Synchronizes local todos with the server.
   * @param todos - The list of todos to sync.
   * @param dispatch - The Redux dispatch function.
   * @param onSyncStart - Callback when sync starts.
   * @param onSyncComplete - Callback when sync completes with synced todos.
   * @param onSyncError - Callback when an error occurs during sync.
   */
  static async syncWithServer(
    todos: Todo[],
    dispatch: AppDispatch,
    onSyncStart: () => void,
    onSyncComplete: (syncedTodos: Todo[]) => void,
    onSyncError: (error: string) => void,
  ): Promise<void> {
    if (!NetworkManager.isConnected) {
      return;
    }

    onSyncStart();

    try {
      const deletedTodoIds = (await StorageService.getDeletedTodoIds?.()) || [];
      for (const id of deletedTodoIds) {
        try {
          console.log('[SyncService] Deleting remote todo:', id);
          await dispatch(todoApi.endpoints.deleteTodo.initiate(Number(id)));
        } catch (error) {
          console.error('Failed to delete remote todo:', id, error);
        }
      }
      await StorageService.clearDeletedTodoIds?.();

      const syncedTodos = [...todos];
      for (const todo of todos) {
        if (todo.synced) {
          continue;
        }

        try {
          const apiTodo: Partial<ApiTodo> = {
            title: todo.title,
            completed: todo.completed,
            userId: 1,
          };

          if (todo.localOnly) {
            console.log('[SyncService] Creating remote todo:', todo.title);
            await dispatch(todoApi.endpoints.createTodo.initiate(apiTodo));
          } else {
            console.log('[SyncService] Updating remote todo:', todo.title);
            const updatePayload = { id: Number(todo.id), todo: apiTodo };
            // removed .unrwap() as we're mocking the API
            await dispatch(
              todoApi.endpoints.updateTodo.initiate(updatePayload),
            );
          }
          const todoIndex = syncedTodos.findIndex(t => t.id === todo.id);
          if (todoIndex !== -1) {
            syncedTodos[todoIndex] = {
              ...syncedTodos[todoIndex],
              synced: true,
              localOnly: false,
            };
          }
        } catch (error) {
          console.error('Failed to sync todo:', todo.id, error);
        }
      }

      await StorageService.saveTodos(syncedTodos);
      await StorageService.saveLastSyncTime(new Date().toISOString());

      onSyncComplete(syncedTodos);
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : 'An unknown sync error occurred';
      console.error(
        '[SyncService] A critical error stopped the sync process:',
        errorMessage,
      );
      onSyncError(errorMessage);
    }
  }
}
