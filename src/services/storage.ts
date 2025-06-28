import AsyncStorage from '@react-native-async-storage/async-storage';
import { Todo } from '../types/todo';

const STORAGE_KEYS = {
  TODOS: '@todos',
  LAST_SYNC: '@last_sync',
  PENDING_SYNC: '@pending_sync',
  DELETED_TODO_IDS: '@deleted_todo_ids',
} as const;

export class StorageService {
  static async saveTodos(todos: Todo[]): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.TODOS, JSON.stringify(todos));
    } catch (error) {
      console.error('Error saving todos:', error);
      throw error;
    }
  }

  static async loadTodos(): Promise<Todo[]> {
    try {
      const todosJson = await AsyncStorage.getItem(STORAGE_KEYS.TODOS);
      return todosJson ? JSON.parse(todosJson) : [];
    } catch (error) {
      console.error('Error loading todos:', error);
      return [];
    }
  }

  static async saveLastSyncTime(timestamp: string): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.LAST_SYNC, timestamp);
    } catch (error) {
      console.error('Error saving sync time:', error);
    }
  }

  static async getLastSyncTime(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(STORAGE_KEYS.LAST_SYNC);
    } catch (error) {
      console.error('Error getting sync time:', error);
      return null;
    }
  }

  static async savePendingSyncItems(items: Todo[]): Promise<void> {
    try {
      await AsyncStorage.setItem(
        STORAGE_KEYS.PENDING_SYNC,
        JSON.stringify(items),
      );
    } catch (error) {
      console.error('Error saving pending sync items:', error);
    }
  }

  static async getPendingSyncItems(): Promise<Todo[]> {
    try {
      const itemsJson = await AsyncStorage.getItem(STORAGE_KEYS.PENDING_SYNC);
      return itemsJson ? JSON.parse(itemsJson) : [];
    } catch (error) {
      console.error('Error getting pending sync items:', error);
      return [];
    }
  }

  static async clearPendingSyncItems(): Promise<void> {
    try {
      await AsyncStorage.removeItem(STORAGE_KEYS.PENDING_SYNC);
    } catch (error) {
      console.error('Error clearing pending sync items:', error);
    }
  }

  static async saveDeletedTodoIds(ids: string[]): Promise<void> {
    try {
      await AsyncStorage.setItem(
        STORAGE_KEYS.DELETED_TODO_IDS,
        JSON.stringify(ids),
      );
    } catch (error) {
      console.error('Error saving deleted todo IDs:', error);
    }
  }

  static async getDeletedTodoIds(): Promise<string[]> {
    try {
      const idsJson = await AsyncStorage.getItem(STORAGE_KEYS.DELETED_TODO_IDS);
      return idsJson ? JSON.parse(idsJson) : [];
    } catch (error) {
      console.error('Error getting deleted todo IDs:', error);
      return [];
    }
  }

  static async clearDeletedTodoIds(): Promise<void> {
    try {
      await AsyncStorage.removeItem(STORAGE_KEYS.DELETED_TODO_IDS);
    } catch (error) {
      console.error('Error clearing deleted todo IDs:', error);
    }
  }
}
