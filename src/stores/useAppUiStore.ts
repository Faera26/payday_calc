import { create } from "zustand";

type AppUiStore = {
  activeSheet: string | null;
  closeSheet: () => void;
  openSheet: (sheetId: string) => void;
};

export const useAppUiStore = create<AppUiStore>((set) => ({
  activeSheet: null,
  closeSheet: () => set({ activeSheet: null }),
  openSheet: (sheetId) => set({ activeSheet: sheetId }),
}));
