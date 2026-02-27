import AsyncStorage from '@react-native-async-storage/async-storage';

const AUTH_KEYS = {
  ACCESS_TOKEN: 'access_token',
  REFRESH_TOKEN: 'refresh_token',
  USER: 'user',
};

export const storage = {
  async getAccessToken(): Promise<string | null> {
    return AsyncStorage.getItem(AUTH_KEYS.ACCESS_TOKEN);
  },

  async setAccessToken(token: string): Promise<void> {
    await AsyncStorage.setItem(AUTH_KEYS.ACCESS_TOKEN, token);
  },

  async getRefreshToken(): Promise<string | null> {
    return AsyncStorage.getItem(AUTH_KEYS.REFRESH_TOKEN);
  },

  async setRefreshToken(token: string): Promise<void> {
    await AsyncStorage.setItem(AUTH_KEYS.REFRESH_TOKEN, token);
  },

  async getUser(): Promise<string | null> {
    return AsyncStorage.getItem(AUTH_KEYS.USER);
  },

  async setUser(user: string): Promise<void> {
    await AsyncStorage.setItem(AUTH_KEYS.USER, user);
  },

  async clearAuth(): Promise<void> {
    await AsyncStorage.multiRemove([
      AUTH_KEYS.ACCESS_TOKEN,
      AUTH_KEYS.REFRESH_TOKEN,
      AUTH_KEYS.USER,
    ]);
  },
};
