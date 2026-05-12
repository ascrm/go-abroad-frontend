import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Plan } from '@/src/types/plan';

const AUTH_KEYS = {
  ACCESS_TOKEN: 'access_token',
  REFRESH_TOKEN: 'refresh_token',
  USER: 'user',
};

const PLAN_KEYS = {
  GENERATING_PLAN: 'generating_plan',
  CURRENT_PLAN: 'current_plan',
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

  async getGeneratingPlan(): Promise<Plan | null> {
    const data = await AsyncStorage.getItem(PLAN_KEYS.GENERATING_PLAN);
    return data ? JSON.parse(data) : null;
  },

  async setGeneratingPlan(plan: Plan | null): Promise<void> {
    if (plan) {
      await AsyncStorage.setItem(PLAN_KEYS.GENERATING_PLAN, JSON.stringify(plan));
    } else {
      await AsyncStorage.removeItem(PLAN_KEYS.GENERATING_PLAN);
    }
  },

  async getCurrentPlan(): Promise<Plan | null> {
    const data = await AsyncStorage.getItem(PLAN_KEYS.CURRENT_PLAN);
    return data ? JSON.parse(data) : null;
  },

  async setCurrentPlan(plan: Plan | null): Promise<void> {
    if (plan) {
      await AsyncStorage.setItem(PLAN_KEYS.CURRENT_PLAN, JSON.stringify(plan));
    } else {
      await AsyncStorage.removeItem(PLAN_KEYS.CURRENT_PLAN);
    }
  },
};
