import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

interface SyncIndicatorProps {
  isOnline: boolean;
  isSyncing: boolean;
  lastSyncTime?: string | null;
}

export const SyncIndicator: React.FC<SyncIndicatorProps> = ({
  isOnline,
  isSyncing,
  lastSyncTime,
}) => {
  const spinValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (isSyncing) {
      const spinAnimation = Animated.loop(
        Animated.timing(spinValue, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      );
      spinAnimation.start();
      return () => spinAnimation.stop();
    }
  }, [isSyncing, spinValue]);

  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const getStatusIcon = () => {
    if (isSyncing) {
      return (
        <Animated.View style={{ transform: [{ rotate: spin }] }}>
          <Icon name="sync" size={24} color="#2196F3" />
        </Animated.View>
      );
    }
    if (isOnline) {
      return <Icon name="cloud-done" size={24} color="#4CAF50" />;
    }
    return <Icon name="cloud-off" size={24} color="#FF9800" />;
  };

  const getStatusText = () => {
    if (isSyncing) return 'Syncing...';
    if (isOnline) return 'Online';
    return 'Offline';
  };

  const formatLastSyncTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMinutes = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60),
    );

    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;

    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;

    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}d ago`;
  };

  return (
    <View style={styles.container}>
      <View style={styles.statusContainer}>
        {getStatusIcon()}
        <Text style={styles.statusText}>{getStatusText()}</Text>
      </View>
      {lastSyncTime && !isSyncing && (
        <Text style={styles.lastSyncText}>
          Last sync: {formatLastSyncTime(lastSyncTime)}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#F8F9FA',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statusText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  lastSyncText: {
    fontSize: 14,
    color: '#666',
  },
});
