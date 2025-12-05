import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';


const useResultPresenceStore = create(
	persist((set) => ({
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


export { useResultPresenceStore, useModalStore };