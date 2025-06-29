import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { View, StyleSheet, SafeAreaView, Pressable } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import Icon from 'react-native-vector-icons/MaterialIcons';

// Components with path aliases
import BottomSheet from '@components/common/BottomSheet';
import { TaskList } from '@components/task/TaskList';
import { TaskForm } from '@components/task/TaskForm';
import { SyncIndicator } from '@components/common/SyncIndicator';
import { Button } from '@components/common/Button';

// Store with path aliases
import { RootState, AppDispatch } from '@store/redux/store';
import {
  loadTodosFromStorage,
  createTodo as createTodoRedux,
  updateTodo as updateTodoRedux,
  deleteTodo as deleteTodoRedux,
  setSyncStatus,
  markTodoAsSynced,
  updateSyncTime,
} from '@store/redux/slices/todoSlice';

// Hooks and services with path aliases
import { useNetworkStatus } from '@hooks/useNetworkStatus';
import { SyncService } from '@services/syncService';
import type { Todo, CreateTodoRequest } from '@typings/todo';
import { useSnackbar } from '@utils/snackbar';

export const TodoScreen: React.FC = () => {
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [editingTodo, setEditingTodo] = useState<Todo | null>(null);
  const [activeTab, setActiveTab] = useState<'pending' | 'completed'>(
    'pending',
  );

  const dispatch = useDispatch<AppDispatch>();
  const isOnline = useNetworkStatus();
  const { dispatch: snackbarDispatch } = useSnackbar();

  // Redux state
  const { todos, isSyncing, lastSyncTime } = useSelector(
    (state: RootState) => state.todos,
  );
  // Filtered todos
  const [pendingTodos, completedTodos] = useMemo(() => {
    const pending: Todo[] = [];
    const completed: Todo[] = [];
    for (const todo of todos) {
      if (todo.completed) {
        completed.push(todo);
      } else {
        pending.push(todo);
      }
    }
    return [pending, completed];
  }, [todos]);

  const showSnackbar = useCallback(
    (
      message: string,
      type: 'success' | 'error' | 'warning' | 'info' = 'info',
    ) => {
      snackbarDispatch?.({
        type: 'open',
        message,
        alertType: type,
        autoClose: true,
      });
    },
    [snackbarDispatch],
  );

  const handleSync = useCallback(async () => {
    if (!isOnline || isSyncing) return;

    await SyncService.syncWithServer(
      todos,
      dispatch,
      () => dispatch(setSyncStatus(true)),
      syncedTodos => {
        dispatch(setSyncStatus(false));
        syncedTodos.forEach(todo => {
          if (todo.synced && !todos.find(t => t.id === todo.id)?.synced) {
            dispatch(markTodoAsSynced(todo.id));
          }
        });
        const newSyncTime = new Date().toISOString();
        dispatch(updateSyncTime(newSyncTime));
      },
      error => {
        dispatch(setSyncStatus(false));
        showSnackbar(error, 'error');
      },
    );
  }, [isOnline, dispatch, todos, isSyncing, showSnackbar]);

  useEffect(() => {
    dispatch(loadTodosFromStorage());
  }, [dispatch]);

  useEffect(() => {
    if (isOnline && todos.some(todo => !todo.synced)) {
      handleSync();
    }
  }, [isOnline, todos, handleSync]);

  const openBottomSheet = useCallback(() => {
    setIsFormVisible(true);
  }, []);

  const closeBottomSheet = useCallback(() => {
    setIsFormVisible(false);
  }, []);

  const handleCreateTodo = useCallback(
    async (todoData: CreateTodoRequest) => {
      try {
        await dispatch(createTodoRedux(todoData));
        closeBottomSheet();
        showSnackbar('Task created successfully!', 'success');

        if (isOnline) {
          await handleSync();
        }
      } catch (error) {
        showSnackbar('Failed to create task', 'error');
      }
    },
    [dispatch, closeBottomSheet, isOnline, handleSync, showSnackbar],
  );

  const handleUpdateTodo = useCallback(
    async (todoData: CreateTodoRequest) => {
      if (!editingTodo) return;
      try {
        await dispatch(
          updateTodoRedux({
            id: editingTodo.id,
            title: todoData.title,
            description: todoData.description,
          }),
        );
        closeBottomSheet();
        setEditingTodo(null);
        showSnackbar('Task updated successfully!', 'success');

        if (isOnline) {
          await handleSync();
        }
      } catch (error) {
        showSnackbar('Failed to update task', 'error');
      }
    },
    [
      dispatch,
      editingTodo,
      closeBottomSheet,
      isOnline,
      handleSync,
      showSnackbar,
    ],
  );

  const handleToggleComplete = useCallback(
    async (id: string, completed: boolean) => {
      try {
        await dispatch(updateTodoRedux({ id, completed }));
        showSnackbar(
          completed ? 'Task marked as completed!' : 'Task marked as pending!',
          'success',
        );

        if (isOnline) {
          await handleSync();
        }
      } catch (error) {
        showSnackbar('Failed to update task', 'error');
      }
    },
    [dispatch, isOnline, handleSync, showSnackbar],
  );

  const handleEditTodo = useCallback(
    (todo: Todo) => {
      setEditingTodo(todo);
      openBottomSheet();
    },
    [openBottomSheet],
  );

  const handleDeleteTodo = useCallback(
    async (id: string) => {
      try {
        await dispatch(deleteTodoRedux(id));
        showSnackbar('Task deleted successfully!', 'error');

        if (isOnline) {
          await handleSync();
        }
      } catch (error) {
        showSnackbar('Failed to delete task', 'error');
      }
    },
    [dispatch, isOnline, handleSync, showSnackbar],
  );

  const handleFormSubmit = (todoData: CreateTodoRequest) => {
    if (editingTodo) {
      handleUpdateTodo(todoData);
    } else {
      handleCreateTodo(todoData);
    }
  };

  const handleCloseForm = () => {
    setEditingTodo(null);
    closeBottomSheet();
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Sync Indicator */}
      <SyncIndicator
        isOnline={isOnline}
        isSyncing={isSyncing}
        lastSyncTime={lastSyncTime}
      />

      {/* Tab Navigation */}
      <View style={styles.tabContainer}>
        <Button
          title={`Pending (${pendingTodos.length})`}
          size={'large'}
          variant={activeTab === 'pending' ? 'primary' : 'secondary'}
          onPress={() => setActiveTab('pending')}
          style={styles.tabButton}
        />
        <Button
          title={`Completed (${completedTodos.length})`}
          size={'large'}
          variant={activeTab === 'completed' ? 'primary' : 'secondary'}
          onPress={() => setActiveTab('completed')}
          style={styles.tabButton}
        />
      </View>

      {/* Task Lists */}
      <View style={styles.content}>
        {activeTab === 'pending' ? (
          <TaskList
            todos={pendingTodos}
            title="Pending Tasks"
            onToggleComplete={handleToggleComplete}
            onEdit={handleEditTodo}
            onDelete={handleDeleteTodo}
            emptyMessage="No pending tasks. Create one!"
          />
        ) : (
          <TaskList
            todos={completedTodos}
            title="Completed Tasks"
            onToggleComplete={handleToggleComplete}
            onEdit={handleEditTodo}
            onDelete={handleDeleteTodo}
            emptyMessage="No completed tasks yet."
          />
        )}
      </View>

      {/* Add Button */}
      <Pressable
        style={styles.fabButton}
        android_ripple={{ color: '#005bb5', borderless: true }}
        onPress={() => {
          setEditingTodo(null);
          openBottomSheet();
        }}
      >
        <Icon name="add" size={32} color="#FFFFFF" />
      </Pressable>

      {/* Task Form Custom Bottom Sheet */}
      <BottomSheet visible={isFormVisible} onClose={handleCloseForm} scrollable>
        <TaskForm
          onClose={handleCloseForm}
          onSubmit={handleFormSubmit}
          editingTodo={editingTodo}
          isLoading={isSyncing}
        />
      </BottomSheet>
    </SafeAreaView>
  );
};

export default TodoScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  tabContainer: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
  },
  tabButton: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  fabButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#007AFF',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
});
