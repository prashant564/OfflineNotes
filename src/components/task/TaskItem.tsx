import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { Todo } from '@typings/todo';
import { Button } from '@components/common/Button';
import { useSnackbar } from '@utils/snackbar';

interface TaskItemProps {
  todo: Todo;
  onToggleComplete: (id: string, completed: boolean) => void;
  onEdit: (todo: Todo) => void;
  onDelete: (id: string) => void;
}

const TaskItem: React.FC<TaskItemProps> = ({
  todo,
  onToggleComplete,
  onEdit,
  onDelete,
}) => {
  const [expanded, setExpanded] = useState(false);
  const { dispatch: snackbarDispatch } = useSnackbar();

  const handleDelete = () => {
    snackbarDispatch?.({
      type: 'open',
      message: 'Are you sure you want to delete this task?',
      alertType: 'warning',
      actionText: 'Delete',
      autoClose: false,
      closerFn: () => onDelete(todo.id),
    });
  };

  const getSyncStatusIcon = () => {
    if (todo.synced) {
      return <Icon name="cloud-done" size={16} color="#4CAF50" />;
    } else if (todo.localOnly) {
      return <Icon name="cloud-off" size={16} color="#FF9800" />;
    } else {
      return <Icon name="cloud-queue" size={16} color="#2196F3" />;
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.header}
        onPress={() => setExpanded(!expanded)}
        activeOpacity={0.8}
      >
        <TouchableOpacity
          style={styles.checkbox}
          onPress={() => onToggleComplete(todo.id, !todo.completed)}
        >
          <Icon
            name={todo.completed ? 'check-circle' : 'radio-button-unchecked'}
            size={24}
            color={todo.completed ? '#4CAF50' : '#CCCCCC'}
          />
        </TouchableOpacity>

        <View style={styles.content}>
          <Text
            style={[styles.title, todo.completed && styles.completedTitle]}
            numberOfLines={expanded ? undefined : 1}
          >
            {todo.title}
          </Text>
          {expanded && todo.description && (
            <Text style={styles.description}>{todo.description}</Text>
          )}
        </View>

        <View style={styles.rightSection}>
          {getSyncStatusIcon()}
          <Icon
            name={expanded ? 'expand-less' : 'expand-more'}
            size={20}
            color="#666"
          />
        </View>
      </TouchableOpacity>

      {expanded && (
        <View style={styles.actions}>
          <Button
            title="Edit"
            variant="secondary"
            size="small"
            onPress={() => onEdit(todo)}
            style={styles.actionButton}
          />
          <Button
            title="Delete"
            variant="danger"
            size="small"
            onPress={handleDelete}
            style={styles.actionButton}
          />
        </View>
      )}
    </View>
  );
};

export default React.memo(TaskItem);

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    marginVertical: 4,
    marginHorizontal: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  checkbox: {
    marginRight: 12,
    padding: 4,
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  completedTitle: {
    textDecorationLine: 'line-through',
    color: '#999',
  },
  description: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  actions: {
    flexDirection: 'row',
    padding: 16,
    paddingTop: 0,
    gap: 12,
  },
  actionButton: {
    flex: 1,
  },
});
