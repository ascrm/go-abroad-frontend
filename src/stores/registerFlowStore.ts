import { create } from 'zustand';

interface RegisterFlowState {
  account: string;        // 手机号/邮箱
  accountType: 2 | 3 | undefined;  // 2-邮箱，3-手机号
  code: string;           // 验证码
  codeId: string;        // 验证码ID
  username: string;      // 用户名
  password: string;      // 密码
  avatar: string;        // 头像URL
  age: number | undefined;
  gender: 0 | 1 | 2 | undefined;  // 0-未知，1-男，2-女

  setAccount: (account: string, accountType: 2 | 3) => void;
  setCode: (code: string, codeId?: string) => void;
  setUsername: (username: string) => void;
  setPassword: (password: string) => void;
  setAvatar: (avatar: string) => void;
  setAge: (age: number) => void;
  setGender: (gender: 0 | 1 | 2) => void;
  reset: () => void;
}

const initialState = {
  account: '',
  accountType: undefined,
  code: '',
  codeId: '',
  username: '',
  password: '',
  avatar: '',
  age: undefined,
  gender: undefined,
};

export const useRegisterFlowStore = create<RegisterFlowState>((set) => ({
  ...initialState,

  setAccount: (account, accountType) => set({ account, accountType }),
  setCode: (code, codeId) => set({ code, ...(codeId && { codeId }) }),
  setUsername: (username) => set({ username }),
  setPassword: (password) => set({ password }),
  setAvatar: (avatar) => set({ avatar }),
  setAge: (age) => set({ age }),
  setGender: (gender) => set({ gender }),
  reset: () => set(initialState),
}));
