import { create } from 'zustand';
import api from '../services/api';

export const useShelterStore = create((set) => ({
  shelters: [],
  isLoading: false,

  fetchShelters: async () => {
    set({ isLoading: true });
    try {
      const response = await api.get('/shelters');
      set({ shelters: response.data.data, isLoading: false });
    } catch (error) {
      console.error('Failed to fetch shelters:', error);
      set({ isLoading: false });
    }
  }
}));
