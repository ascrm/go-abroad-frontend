import { create } from "zustand";

interface ResetPasswordState {
  account: string;
  accountType: number; // 1=手机, 2=邮箱
  code: string;
  password: string;
  setAccount: (account: string, accountType: number) => void;
  setCode: (code: string) => void;
  setPassword: (password: string) => void;
  reset: () => void;
}

const useResetPasswordStore = create<ResetPasswordState>((set) => ({
  account: "",
  accountType: 0,
  code: "",
  password: "",
  setAccount: (account, accountType) => set({ account, accountType }),
  setCode: (code) => set({ code }),
  setPassword: (password) => set({ password }),
  reset: () => set({ account: "", accountType: 0, code: "", password: "" }),
}));

export { useResetPasswordStore };
