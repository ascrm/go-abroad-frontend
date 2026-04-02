import { create } from 'zustand';
import type { Plan } from '@/src/types/plan';
import * as planApi from '@/src/api/plan';

interface PlanState {
  plans: Plan[];
  isLoading: boolean;
  lastFetchTime: number | null;

  fetchPlans: (force?: boolean) => Promise<void>;
  createPlan: (plan: Plan) => void;
  updatePlan: (plan: Plan) => void;
  deletePlan: (planId: number) => void;
  syncGeneratingPlan: (plan: Plan | null) => void;
}

const CACHE_DURATION = 5 * 60 * 1000; // 缓存有效期 5 分钟

export const usePlanStore = create<PlanState>((set, get) => ({
  plans: [],
  isLoading: false,
  lastFetchTime: null,

  fetchPlans: async (force = false) => {
    const { plans, lastFetchTime, isLoading } = get();

    // 有缓存且未过期，且不是强制刷新，跳过请求
    if (!force && plans.length > 0 && lastFetchTime && Date.now() - lastFetchTime < CACHE_DURATION) {
      return;
    }

    // 已有请求在进行中
    if (isLoading) return;

    set({ isLoading: true });
    try {
      const response = await planApi.getPlanList({ pageSize: 20 });
      if (response) {
        set({ plans: response.list ?? [], lastFetchTime: Date.now(), isLoading: false });
      } else {
        set({ isLoading: false });
      }
    } catch {
      set({ isLoading: false });
    }
  },

  createPlan: (plan) => {
    set((state) => ({ plans: [plan, ...state.plans] }));
  },

  updatePlan: (plan) => {
    set((state) => ({
      plans: state.plans.map((p) => (p.id === plan.id ? plan : p)),
    }));
  },

  deletePlan: (planId) => {
    set((state) => ({
      plans: state.plans.filter((p) => p.id !== planId),
    }));
  },

  syncGeneratingPlan: (plan) => {
    set((state) => {
      if (!plan) return state;
      const exists = state.plans.some((p) => p.id === plan.id);
      if (exists) {
        return { plans: state.plans.map((p) => (p.id === plan.id ? plan : p)) };
      }
      return { plans: [plan, ...state.plans] };
    });
  },
}));
