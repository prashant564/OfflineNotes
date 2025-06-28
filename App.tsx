import React, { useEffect } from 'react';
import { StatusBar } from 'react-native';
import { Provider } from 'react-redux';
import { SafeAreaView } from 'react-native-safe-area-context';
import { store } from './src/store/redux/store';
import { NetworkManager } from './src/services/networkManager';
import TodoScreen from './src/screens/TodoScreen';

const App: React.FC = () => {
  useEffect(() => {
    NetworkManager.initialize();
  }, []);

  return (
    <SafeAreaView style={{ flex: 1 }} edges={['top', 'bottom']}>
      <Provider store={store}>
        <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
        <TodoScreen />
      </Provider>
    </SafeAreaView>
  );
};

export default App;
