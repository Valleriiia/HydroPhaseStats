import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

// Стор для збереження самого результату аналізу (дані)
const useAnalysisStore = create((set) => ({
  data: null, // Тут буде весь великий JSON з Python
  setAnalysisData: (data) => set({ data }),
  clearAnalysisData: () => set({ data: null }),
}));

// Стор для UI станів (чи є результат, коли був зроблений)
const useResultPresenceStore = create(
  persist(
    (set) => ({
      hasResult: false,
      timestamp: null,

      setResultPresence: () => {
        const now = Date.now();
        set((state) => ({
          hasResult: true,
          timestamp: now,
        }));
      },
      clearResultPresence: () => set({
        hasResult: false,
        timestamp: null,
      }),
    }),
    {
      name: 'result-presence',
      storage: createJSONStorage(() => localStorage),
    }
  )
);

const useModalStore = create((set) => ({
  current: null,
  open: (name, props = {}) => {
    set({ current: { name, props } });
  },
  close: () => {
    set({ current: null });
  },
}));

export { useResultPresenceStore, useModalStore, useAnalysisStore };