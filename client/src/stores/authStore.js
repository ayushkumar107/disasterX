import { create } from 'zustand';
import api from '../services/api';
import { useLocationStore } from './locationStore';
import { useSocketStore } from './socketStore';

export const useAuthStore = create((set, get) => ({
  user: JSON.parse(localStorage.getItem('user') || 'null'),
  isAuthenticated: !!localStorage.getItem('accessToken'),
  isLoading: false,
  error: null,
  login: async (email, password) => {
    set({
      isLoading: true,
      error: null
    });
    try {
      const {
        data
      } = await api.post('/auth/login', {
        email,
        password
      });
      localStorage.setItem('accessToken', data.accessToken);
      localStorage.setItem('refreshToken', data.refreshToken);
      localStorage.setItem('user', JSON.stringify(data.user));
      set({
        user: data.user,
        isAuthenticated: true,
        isLoading: false
      });
    } catch (error) {
      const message = error.response?.data?.error || 'Login failed';
      set({
        error: message,
        isLoading: false
      });
      throw new Error(message);
    }
  },
  register: async (name, email, password) => {
    set({
      isLoading: true,
      error: null
    });
    try {
      const {
        data
      } = await api.post('/auth/register', {
        name,
        email,
        password
      });
      localStorage.setItem('accessToken', data.accessToken);
      localStorage.setItem('refreshToken', data.refreshToken);
      localStorage.setItem('user', JSON.stringify(data.user));
      set({
        user: data.user,
        isAuthenticated: true,
        isLoading: false
      });
    } catch (error) {
      const message = error.response?.data?.error || 'Registration failed';
      set({
        error: message,
        isLoading: false
      });
      throw new Error(message);
    }
  },
  logout: async () => {
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      await api.post('/auth/logout', {
        refreshToken
      });
    } catch {
      // Continue logout even if server request fails
    }
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');

    // Clean up live GPS tracking and clear user location on logout
    try {
      useLocationStore.getState().stopTracking();
      useLocationStore.setState({ userLocation: null, accuracy: null });
    } catch {
      // ignore
    }

    // Disconnect active socket session on logout
    try {
      useSocketStore.getState().disconnectSocket();
    } catch {
      // ignore
    }

    set({
      user: null,
      isAuthenticated: false
    });
  },
  loadUser: async () => {
    const token = localStorage.getItem('accessToken');
    if (!token) return;
    try {
      const {
        data
      } = await api.get('/auth/me');
      localStorage.setItem('user', JSON.stringify(data));
      set({
        user: data,
        isAuthenticated: true
      });
    } catch {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      set({
        user: null,
        isAuthenticated: false
      });
    }
  },
  clearError: () => set({
    error: null
  }),
  updateProfile: async updates => {
    try {
      const {
        data
      } = await api.patch('/auth/profile', updates);
      localStorage.setItem('user', JSON.stringify(data));
      set({
        user: data
      });
    } catch (error) {
      const message = error.response?.data?.error || 'Update failed';
      set({
        error: message
      });
    }
  }
}));
