import React, { useEffect } from 'react';
import { StatusBar } from 'react-native';
import { Provider } from 'react-redux';
import { SafeAreaView } from 'react-native-safe-area-context';
import { store } from './src/store/redux/store';
import { NetworkManager } from './src/services/networkManager';
import TodoScreen from './src/screens/TodoScreen';
import { SnackbarProvider } from '@utils/snackbar';
import { Snackbar } from '@components/common/Snackbar';
import { WrappedApp } from '@components/common/WrappedApp';

const App: React.FC = () => {
  useEffect(() => {
    NetworkManager.initialize();
  }, []);

  return (
    <SafeAreaView style={{ flex: 1 }} edges={['top', 'bottom']}>
      <Provider store={store}>
        <SnackbarProvider>
          <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
          <WrappedApp>
            <TodoScreen />
          </WrappedApp>
          <Snackbar />
        </SnackbarProvider>
      </Provider>
    </SafeAreaView>
  );
};

export default App;
