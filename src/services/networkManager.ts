import NetInfo from '@react-native-community/netinfo';

export class NetworkManager {
  private static listeners: Set<(isOnline: boolean) => void> = new Set();
  private static isOnline = false;

  static initialize(): void {
    NetInfo.addEventListener(state => {
      const wasOnline = this.isOnline;
      this.isOnline = state.isConnected ?? false;

      if (!wasOnline && this.isOnline) {
        // Device just came online
        this.notifyListeners(true);
      } else if (wasOnline && !this.isOnline) {
        // Device just went offline
        this.notifyListeners(false);
      }
    });
  }

  static addNetworkListener(callback: (isOnline: boolean) => void): () => void {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  private static notifyListeners(isOnline: boolean): void {
    this.listeners.forEach(listener => listener(isOnline));
  }

  static async getNetworkStatus(): Promise<boolean> {
    const state = await NetInfo.fetch();
    return state.isConnected ?? false;
  }

  static get isConnected(): boolean {
    return this.isOnline;
  }
}
