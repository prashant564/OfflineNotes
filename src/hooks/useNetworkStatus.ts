import { useState, useEffect } from 'react';
import { NetworkManager } from '@services/networkManager';

export const useNetworkStatus = () => {
  const [isOnline, setIsOnline] = useState(NetworkManager.isConnected);

  useEffect(() => {
    const unsubscribe = NetworkManager.addNetworkListener(setIsOnline);

    // Get initial status
    NetworkManager.getNetworkStatus().then(setIsOnline);

    return unsubscribe;
  }, []);

  return isOnline;
};
