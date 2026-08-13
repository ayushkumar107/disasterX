import { create } from 'zustand';
import api from '../services/api';

export const useSOSStore = create((set, get) => ({
  sosAlerts: [],
  activeSOS: null,
  isLoading: false,
  error: null,
  isModalOpen: false,

  setModalOpen: (isOpen) => set({ isModalOpen: isOpen }),

  triggerSOS: async (sosData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.post('/sos', sosData);
      set({ activeSOS: response.data.data, isLoading: false, isModalOpen: false });
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to trigger SOS';
      set({ error: message, isLoading: false });
      throw new Error(message);
    }
  },

  fetchActiveSOS: async () => {
    try {
      const response = await api.get('/sos');
      set({ sosAlerts: response.data.data });
    } catch (error) {
      console.error('Failed to fetch SOS alerts:', error);
    }
  }
}));
