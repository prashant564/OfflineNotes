import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { View, StyleSheet, SafeAreaView, Alert, Pressable } from 'react-native';
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
} from '@store/redux/slices/todoSlice';

// Hooks and services with path aliases
import { useNetworkStatus } from '@hooks/useNetworkStatus';
import { SyncService } from '@services/syncService';
import type { Todo, CreateTodoRequest } from '@typings/todo';

export const TodoScreen: React.FC = () => {
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [editingTodo, setEditingTodo] = useState<Todo | null>(null);
  const [activeTab, setActiveTab] = useState<'pending' | 'completed'>(
    'pending',
  );

  const dispatch = useDispatch<AppDispatch>();
  const isOnline = useNetworkStatus();

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
      },
      error => {
        dispatch(setSyncStatus(false));
        Alert.alert('Sync Error', error);
      },
    );
  }, [isOnline, dispatch, todos, isSyncing]);

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
      } catch (error) {
        Alert.alert('Error', 'Failed to create task');
      }
    },
    [dispatch, closeBottomSheet],
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
      } catch (error) {
        Alert.alert('Error', 'Failed to update task');
      }
    },
    [dispatch, editingTodo, closeBottomSheet],
  );

  const handleToggleComplete = useCallback(
    async (id: string, completed: boolean) => {
      try {
        await dispatch(updateTodoRedux({ id, completed }));
      } catch (error) {
        Alert.alert('Error', 'Failed to update task');
      }
    },
    [dispatch],
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
      } catch (error) {
        Alert.alert('Error', 'Failed to delete task');
      }
    },
    [dispatch],
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
          variant={activeTab === 'pending' ? 'primary' : 'secondary'}
          onPress={() => setActiveTab('pending')}
          style={styles.tabButton}
        />
        <Button
          title={`Completed (${completedTodos.length})`}
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
