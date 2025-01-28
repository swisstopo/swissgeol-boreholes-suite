import { create } from "zustand";

interface FormDirtyState {
  isFormDirty: boolean;
  setIsFormDirty: (newState: boolean) => void;
}
export const useFormDirtyStore = create<FormDirtyState>(set => ({
  isFormDirty: false,
  setIsFormDirty: newState => set(() => ({ isFormDirty: newState })),
}));
