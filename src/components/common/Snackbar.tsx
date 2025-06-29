import React, { useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  TouchableOpacity,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useSnackbar } from '@utils/snackbar';

export const Snackbar: React.FC = () => {
  const { alert, dispatch } = useSnackbar();
  const translateY = useMemo(() => new Animated.Value(-120), []);

  useEffect(() => {
    if (alert?.open) {
      // Slide in
      Animated.spring(translateY, {
        toValue: 0,
        useNativeDriver: true,
      }).start();

      // Auto close if enabled
      if (alert.autoClose) {
        const timer = setTimeout(() => {
          dispatch?.({ type: 'close' });
        }, 4000);

        return () => clearTimeout(timer);
      }
    } else {
      // Slide out
      Animated.spring(translateY, {
        toValue: -120,
        useNativeDriver: true,
      }).start();
    }
  }, [alert?.open, alert?.autoClose, dispatch, translateY]);

  const handleAction = () => {
    dispatch?.({ type: 'close' });
    alert?.actionFn?.();
  };

  const handleClose = () => {
    dispatch?.({ type: 'close' });
    alert?.closerFn?.();
  };

  const getBackgroundColor = () => {
    switch (alert?.alertType) {
      case 'success':
        return '#4CAF50';
      case 'error':
        return '#F44336';
      case 'warning':
        return '#FF9800';
      case 'info':
      default:
        return '#2196F3';
    }
  };

  const getIcon = () => {
    switch (alert?.alertType) {
      case 'success':
        return 'check-circle';
      case 'error':
        return 'error';
      case 'warning':
        return 'warning';
      case 'info':
      default:
        return 'info';
    }
  };

  if (!alert?.open) return null;

  return (
    <Animated.View
      style={[
        styles.container,
        { backgroundColor: getBackgroundColor() },
        { transform: [{ translateY }] },
      ]}
    >
      <View style={styles.content}>
        <Icon name={getIcon()} size={24} color="#FFFFFF" style={styles.icon} />
        <Text style={styles.message}>{alert.message}</Text>
      </View>

      <View style={styles.actions}>
        {alert.actionText && (
          <TouchableOpacity onPress={handleAction} style={styles.actionButton}>
            <Text style={styles.actionText}>{alert.actionText}</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
          <Icon name="close" size={20} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 9999,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingTop: 48,
    minHeight: 120,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  content: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    marginRight: 12,
  },
  message: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  actionButton: {
    marginRight: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  actionText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  closeButton: {
    padding: 4,
  },
});
