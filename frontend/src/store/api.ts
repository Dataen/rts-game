import { create } from 'zustand';

interface ApiStore {
    baseUrl: string;
    apiBaseUrl: string;
}

const base = import.meta.env.VITE_API_BASE_URL || 'http://10.0.0.25:7000';

export const useApiStore = create<ApiStore>(() => ({
    baseUrl: base,
    apiBaseUrl: `${base}/api`,
}));
