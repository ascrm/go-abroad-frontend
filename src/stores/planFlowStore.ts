import { create } from 'zustand';
import type { Destination, PlanFormData, PlanType } from '@/src/types/plan';

interface PlanFlowState {
  abroadType: PlanType | null;
  destination: Destination;
  formData: Partial<PlanFormData>;

  setAbroadType: (type: PlanType) => void;
  setDestination: (destination: Destination) => void;
  setFormData: (key: string, value: string) => void;
  reset: () => void;
}

const initialState = {
  abroadType: null,
  destination: { country: '' },
  formData: {} as Partial<PlanFormData>,
};

export const usePlanFlowStore = create<PlanFlowState>((set) => ({
  ...initialState,

  setAbroadType: (abroadType) => set({ abroadType }),
  setDestination: (destination) => set({ destination }),
  setFormData: (key, value) => set((state) => ({
    formData: { ...state.formData, [key]: value },
  })),
  reset: () => set(initialState),
}));