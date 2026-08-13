import { create } from 'zustand';
import api from '../services/api';
export const useDisasterStore = create((set, get) => ({
  disasters: [],
  selectedDisaster: null,
  filters: {
    types: [],
    severities: [],
    status: ['ACTIVE', 'MONITORING'],
    search: ''
  },
  isLoading: false,
  error: null,
  fetchDisasters: async () => {
    set({
      isLoading: true,
      error: null
    });
    try {
      const {
        data
      } = await api.get('/disasters', {
        params: {
          limit: 500
        }
      });
      set({
        disasters: data.data || data,
        isLoading: false
      });
    } catch (error) {
      set({
        error: 'Failed to fetch disasters',
        isLoading: false
      });
    }
  },
  setSelectedDisaster: disaster => set({
    selectedDisaster: disaster
  }),
  updateFilters: newFilters => set(state => ({
    filters: {
      ...state.filters,
      ...newFilters
    }
  })),
  toggleTypeFilter: type => set(state => {
    const types = state.filters.types.includes(type) ? state.filters.types.filter(t => t !== type) : [...state.filters.types, type];
    return {
      filters: {
        ...state.filters,
        types
      }
    };
  }),
  toggleSeverityFilter: severity => set(state => {
    const severities = state.filters.severities.includes(severity) ? state.filters.severities.filter(s => s !== severity) : [...state.filters.severities, severity];
    return {
      filters: {
        ...state.filters,
        severities
      }
    };
  }),
  addDisaster: disaster => set(state => ({
    disasters: [disaster, ...state.disasters]
  })),
  updateDisaster: updated => set(state => ({
    disasters: state.disasters.map(d => d._id === updated._id ? updated : d)
  }))
}));
