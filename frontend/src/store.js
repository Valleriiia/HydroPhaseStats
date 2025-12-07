import { create } from 'zustand';

const useParametersStore = create((set) => ({
    fftWindow: 'hamming',
    stftWindow: '256points',
    signalNormalization: 'nonormalization',
    setFftWindow: (val) => set({ fftWindow: val }),
    setStftWindow: (val) => set({ stftWindow: val }),
    setSignalNormalization: (val) => set({ signalNormalization: val }),
}));

const useAnalysisStore = create(
    (set) => ({
        data: null,
        hasResult: false,
        selectedMethod: 'oscillogram',
        originalFileName: 'analysis',

        setAnalysisData: (data, fileName) => {
            set({ data, originalFileName: fileName || 'analysis', hasResult: !!data });
        },

        clearAnalysisData: () => set({ data: null, originalFileName: 'analysis', hasResult: false }),

        setSelectedMethod: (method) => set({ selectedMethod: method }),
    })
);

const useModalStore = create((set) => ({
    current: null,
    open: (name, props = {}) => set({ current: { name, props } }),
    close: () => set({ current: null }),
}));

export { useParametersStore, useAnalysisStore, useModalStore };