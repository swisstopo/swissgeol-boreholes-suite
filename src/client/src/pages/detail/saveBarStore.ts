import { create } from "zustand";

interface SaveBarState {
  showSaveFeedback: boolean;
  setShowSaveFeedback: (newState: boolean) => void;
}
export const useSaveBarState = create<SaveBarState>(set => ({
  showSaveFeedback: false,
  setShowSaveFeedback: newState => set(() => ({ showSaveFeedback: newState })),
}));
