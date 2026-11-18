import { create } from 'zustand';
import api from '../services/api';

export const useRainfallStore = create((set, get) => ({
  rainfallData: [],
  selectedZoneRainfall: null,
  history: [],
  isLoading: false,

  fetchRainfallData: async () => {
    set({ isLoading: true });
    try {
      const response = await api.get('/rainfall');
      set({ rainfallData: response.data.data, isLoading: false });
    } catch (err) {
      console.error(err);
      set({ isLoading: false });
    }
  },

  fetchRainfallForZone: async (zoneId) => {
    try {
      const response = await api.get(`/rainfall/zone/${zoneId}`);
      set({ selectedZoneRainfall: response.data.data });
    } catch (err) {
      console.error(err);
    }
  },

  fetchRainfallHistory: async (zoneId, hours = 72) => {
    try {
      const response = await api.get(`/rainfall/history/${zoneId}?hours=${hours}`);
      set({ history: response.data.data });
    } catch (err) {
      console.error(err);
    }
  }
}));
