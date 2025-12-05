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

const useAnalysisStore = create((set) => ({
    data: null,
    selectedMethod: 'oscillogram',
    originalFileName: 'analysis', 
    
    setAnalysisData: (data, fileName) => set({ 
        data, 
        originalFileName: fileName || 'analysis' 
    }),
    
    clearAnalysisData: () => set({ data: null, originalFileName: 'analysis' }),
    setSelectedMethod: (method) => set({ selectedMethod: method }),
}));

const useResultPresenceStore = create(
    persist(
        (set) => ({
            hasResult: false,
            timestamp: null,
            setResultPresence: () => {
                const now = Date.now();
                set({ hasResult: true, timestamp: now });
            },
            clearResultPresence: () => set({ hasResult: false, timestamp: null }),
        }),
        { name: 'result-presence', storage: createJSONStorage(() => localStorage) }
    )
);

const useModalStore = create((set) => ({
    current: null,
    open: (name, props = {}) => set({ current: { name, props } }),
    close: () => set({ current: null }),
}));

export { useResultPresenceStore, useModalStore, useAnalysisStore, useParametersStore };