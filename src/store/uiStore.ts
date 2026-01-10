// ═══════════════════════════════════════════════════════════════════════
// UI STORE - Zustand (modals, toasts, etc.)
// ═══════════════════════════════════════════════════════════════════════

import { create } from 'zustand';

interface UIState {
  modals: Record<string, boolean>;
  openModal: (id: string) => void;
  closeModal: (id: string) => void;
  toggleModal: (id: string) => void;
}

export const useUIStore = create<UIState>((set) => ({
  modals: {},
  openModal: (id) => set((state) => ({ modals: { ...state.modals, [id]: true } })),
  closeModal: (id) => set((state) => ({ modals: { ...state.modals, [id]: false } })),
  toggleModal: (id) => set((state) => ({ modals: { ...state.modals, [id]: !state.modals[id] } })),
}));
