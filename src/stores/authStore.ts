import { create } from 'zustand';
import { authApi } from '../api/auth';
import { getGeneratingPlan } from '../api/plan';
import { userApi, UserUpdateParams } from '../api/user';
import { User } from '../types/auth';
import { storage } from '../utils/storage';

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;

  login: (account: string, password: string) => Promise<void>;
  register: (account: string, password: string, code: string, accountType?: 2 | 3, profile?: RegisterProfile) => Promise<void>;
  socialLogin: (params: Parameters<typeof authApi.socialLogin>[0]) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

interface RegisterProfile {
  nickname?: string;
  avatar?: string;
  gender?: 0 | 1 | 2;
  age?: number;
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

    // 保存到历史账号（账号类型需要根据输入判断，默认手机号）
    await storage.addHistoryAccount(user, 3, account);

    set({ user, isAuthenticated: true });
    await syncGeneratingPlanAfterLogin();
  },

  register: async (account, password, code, accountType, profile) => {
    const { accessToken, refreshToken, user } = (await authApi.register({ account, password, code, accountType }));

    // 保存到本地存储
    await storage.setAccessToken(accessToken);
    await storage.setRefreshToken(refreshToken);
    await storage.setUser(JSON.stringify(user));

    // 保存到历史账号
    await storage.addHistoryAccount(user, accountType ?? 3, account);

    set({ user, isAuthenticated: true });
    await syncGeneratingPlanAfterLogin();

    // 更新用户资料（昵称、头像、性别等）
    if (profile) {
      const updateParams: UserUpdateParams = {};
      if (profile.nickname) updateParams.nickname = profile.nickname;
      if (profile.avatar) updateParams.avatar = profile.avatar;
      if (profile.gender !== undefined) updateParams.gender = profile.gender;
      if (profile.age) {
        // 根据年龄估算生日（假设1月1日）
        const birthYear = new Date().getFullYear() - profile.age;
        updateParams.birthday = `${birthYear}-01-01`;
      }

      try {
        const updatedUser = await userApi.update(updateParams);
        await storage.setUser(JSON.stringify(updatedUser));
        set({ user: updatedUser });
      } catch (error) {
        // 更新资料失败不影响注册流程，静默忽略
        console.error('更新用户资料失败:', error);
      }
    }
  },

  socialLogin: async (params) => {
    const { accessToken, refreshToken, user } = (await authApi.socialLogin(params));

    await storage.setAccessToken(accessToken);
    await storage.setRefreshToken(refreshToken);
    await storage.setUser(JSON.stringify(user));

    // 第三方登录accountType为1（微信等）
    await storage.addHistoryAccount(user, 1, params.socialType.toString());

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
