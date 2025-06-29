import React, { useEffect, useRef } from 'react';
import { StyleSheet, Animated } from 'react-native';
import { useSnackbar } from '@utils/snackbar';

interface WrappedAppProps {
  children: React.ReactNode;
}

export const WrappedApp: React.FC<WrappedAppProps> = ({ children }) => {
  const translateY = useRef(new Animated.Value(0)).current;
  const { alert } = useSnackbar();
  useEffect(() => {
    const snackbarHeight = 86;

    if (alert?.open) {
      Animated.spring(translateY, {
        toValue: snackbarHeight,
        useNativeDriver: true,
        tension: 100,
        friction: 8,
      }).start();
    } else {
      Animated.spring(translateY, {
        toValue: 0,
        useNativeDriver: true,
        tension: 100,
        friction: 8,
      }).start();
    }
  }, [alert?.open, translateY]);

  return (
    <Animated.View style={[styles.container, { transform: [{ translateY }] }]}>
      {children}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
