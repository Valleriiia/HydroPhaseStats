import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

const useParametersStore = create((set) => ({
    fftWindow: 'hamming',
    stftWindow: '256points',
    signalNormalization: 'nonormalization',

    setFftWindow: (val) => set({ fftWindow: val }),
    setStftWindow: (val) => set({ stftWindow: val }),
    setSignalNormalization: (val) => set({ signalNormalization: val }),
}));

// Стор для збереження результату аналізу та обраного методу
const useAnalysisStore = create((set) => ({
  data: null,
  selectedMethod: 'oscillogram', // Метод за замовчуванням
  
  setAnalysisData: (data) => set({ data }),
  clearAnalysisData: () => set({ data: null }),
  setSelectedMethod: (method) => set({ selectedMethod: method }),
}));

// Стор для UI станів (без змін)
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

export { useResultPresenceStore, useModalStore, useAnalysisStore, useParametersStore };