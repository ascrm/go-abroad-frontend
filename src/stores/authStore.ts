import { create } from 'zustand';
import { authApi } from '../api/auth';
import { getGeneratingPlan } from '../api/plan';
import { User } from '../types/auth';
import { storage } from '../utils/storage';

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;

  login: (account: string, password: string) => Promise<void>;
  register: (account: string, password: string, code: string, accountType?: 2 | 3) => Promise<void>;
  socialLogin: (params: Parameters<typeof authApi.socialLogin>[0]) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

/**
 * 登录成功后同步 generatingPlan 到本地存储
 */
async function syncGeneratingPlanAfterLogin() {
  try {
    const plan = await getGeneratingPlan();
    await storage.setGeneratingPlan(plan ?? null);
  } catch {
    // 请求失败时静默忽略
  }
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: true,
  isAuthenticated: false,

  login: async (account, password) => {
    const { accessToken, refreshToken, user } = (await authApi.login({ account, password }));

    // 保存到本地存储
    await storage.setAccessToken(accessToken);
    await storage.setRefreshToken(refreshToken);
    await storage.setUser(JSON.stringify(user));

    set({ user, isAuthenticated: true });
    await syncGeneratingPlanAfterLogin();
  },

  register: async (account, password, code, accountType) => {
    const { accessToken, refreshToken, user } = (await authApi.register({ account, password, code, accountType }));

    // 保存到本地存储
    await storage.setAccessToken(accessToken);
    await storage.setRefreshToken(refreshToken);
    await storage.setUser(JSON.stringify(user));

    set({ user, isAuthenticated: true });
    await syncGeneratingPlanAfterLogin();
  },

  socialLogin: async (params) => {
    const { accessToken, refreshToken, user } = (await authApi.socialLogin(params));

    await storage.setAccessToken(accessToken);
    await storage.setRefreshToken(refreshToken);
    await storage.setUser(JSON.stringify(user));

    set({ user, isAuthenticated: true });
    await syncGeneratingPlanAfterLogin();
  },

  logout: async () => {
    await storage.clearAuth();
    await storage.setGeneratingPlan(null);
    set({ user: null, isAuthenticated: false });
  },

  checkAuth: async () => {
    const token = await storage.getAccessToken();
    const userStr = await storage.getUser();

    if (token && userStr) {
      try {
        const user = JSON.parse(userStr) as User;
        set({ user, isAuthenticated: true, isLoading: false });
        await syncGeneratingPlanAfterLogin();
      } catch {
        await storage.clearAuth();
        set({ user: null, isAuthenticated: false, isLoading: false });
      }
    } else {
      set({ user: null, isAuthenticated: false, isLoading: false });
    }
  },
}));
