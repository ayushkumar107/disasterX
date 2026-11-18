import { create } from 'zustand';
import api from '../services/api';

export const useWarningStore = create((set, get) => ({
  warnings: [],
  selectedWarning: null,
  zoneWarnings: [],
  isLoading: false,

  fetchActiveWarnings: async () => {
    set({ isLoading: true });
    try {
      const response = await api.get('/warnings');
      set({ warnings: response.data.data, isLoading: false });
    } catch (err) {
      console.error(err);
      set({ isLoading: false });
    }
  },

  fetchWarningById: async (id) => {
    try {
      const response = await api.get(`/warnings/${id}`);
      set({ selectedWarning: response.data.data });
      return response.data.data;
    } catch (err) {
      console.error(err);
    }
  },

  fetchWarningsForZone: async (zoneId) => {
    try {
      const response = await api.get(`/warnings/zone/${zoneId}`);
      set({ zoneWarnings: response.data.data });
    } catch (err) {
      console.error(err);
    }
  },

  cancelWarning: async (id) => {
    try {
      const response = await api.post(`/warnings/${id}/cancel`);
      set(state => ({
        warnings: state.warnings.filter(w => w._id !== id)
      }));
      return response.data.data;
    } catch (err) {
      console.error(err);
      throw err;
    }
  }
}));
