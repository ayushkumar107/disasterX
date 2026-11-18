import { create } from 'zustand';
import api from '../services/api';

export const useSensorStore = create((set, get) => ({
  sensors: [],
  selectedSensorHistory: null,
  isLoading: false,

  fetchSensors: async () => {
    set({ isLoading: true });
    try {
      const response = await api.get('/sensors');
      set({ sensors: response.data.data, isLoading: false });
    } catch (err) {
      console.error(err);
      set({ isLoading: false });
    }
  },

  fetchSensorReadings: async (sensorId, hours = 72) => {
    try {
      const response = await api.get(`/sensors/${sensorId}/readings?hours=${hours}`);
      set({ selectedSensorHistory: response.data.data });
      return response.data.data;
    } catch (err) {
      console.error(err);
    }
  }
}));
