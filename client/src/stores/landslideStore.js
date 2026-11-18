import { create } from 'zustand';
import api from '../services/api';

export const useLandslideStore = create((set, get) => ({
  zones: [],
  selectedZone: null,
  assessments: [],
  roads: [],
  terrain: [],
  stats: null,
  isLoading: false,
  error: null,

  fetchZones: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.get('/landslide/zones');
      set({ zones: response.data.data, isLoading: false });
    } catch (err) {
      set({ error: err.message, isLoading: false });
    }
  },

  fetchZoneById: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.get(`/landslide/zones/${id}`);
      set({ selectedZone: response.data.data, isLoading: false });
      return response.data.data;
    } catch (err) {
      set({ error: err.message, isLoading: false });
    }
  },

  fetchAssessments: async (zoneId) => {
    try {
      const response = await api.get(`/landslide/zones/${zoneId}/assessments`);
      set({ assessments: response.data.data });
    } catch (err) {
      console.error(err);
    }
  },

  fetchRoads: async () => {
    try {
      const response = await api.get('/landslide/roads');
      set({ roads: response.data.data });
    } catch (err) {
      console.error(err);
    }
  },

  fetchTerrain: async () => {
    try {
      const response = await api.get('/landslide/terrain');
      set({ terrain: response.data.data });
    } catch (err) {
      console.error(err);
    }
  },

  fetchStats: async () => {
    try {
      const response = await api.get('/landslide/stats');
      set({ stats: response.data.data });
    } catch (err) {
      console.error(err);
    }
  },

  setSelectedZone: (zone) => set({ selectedZone: zone }),

  simulateScenario: async (zoneId, modifications) => {
    try {
      const response = await api.post(`/landslide/zones/${zoneId}/simulate`, modifications);
      return response.data.data;
    } catch (err) {
      console.error(err);
      throw err;
    }
  }
}));
