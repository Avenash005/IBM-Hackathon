import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      // Set user and token
      setAuth: (user, token) => {
        set({ user, token, isAuthenticated: true, error: null });
        // Set axios default header
        if (token) {
          axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        }
      },

      // Clear auth state
      clearAuth: () => {
        set({ user: null, token: null, isAuthenticated: false, error: null });
        delete axios.defaults.headers.common['Authorization'];
      },

      // Login with token (from OAuth callback)
      login: async (token) => {
        set({ isLoading: true, error: null });
        try {
          // Set token in axios
          axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          
          // Fetch user data
          const response = await axios.get(`${API_URL}/auth/me`);
          
          set({
            user: response.data.data,
            token,
            isAuthenticated: true,
            isLoading: false,
            error: null
          });
          
          return response.data.data;
        } catch (error) {
          set({
            user: null,
            token: null,
            isAuthenticated: false,
            isLoading: false,
            error: error.response?.data?.message || 'Failed to authenticate'
          });
          throw error;
        }
      },

      // Logout
      logout: async () => {
        try {
          await axios.post(`${API_URL}/auth/logout`);
        } catch (error) {
          console.error('Logout error:', error);
        } finally {
          get().clearAuth();
        }
      },

      // Refresh user data
      refreshUser: async () => {
        const { token } = get();
        if (!token) return;

        try {
          const response = await axios.get(`${API_URL}/auth/me`);
          set({ user: response.data.data });
        } catch (error) {
          console.error('Failed to refresh user:', error);
          // If token is invalid, clear auth
          if (error.response?.status === 401) {
            get().clearAuth();
          }
        }
      },

      // Update user settings
      updateSettings: async (settings) => {
        set({ isLoading: true });
        try {
          const response = await axios.put(`${API_URL}/auth/settings`, settings);
          set({
            user: response.data.data,
            isLoading: false,
            error: null
          });
          return response.data.data;
        } catch (error) {
          set({
            isLoading: false,
            error: error.response?.data?.message || 'Failed to update settings'
          });
          throw error;
        }
      },

      // Initialize auth from stored token
      initAuth: async () => {
        const { token } = get();
        if (token) {
          try {
            await get().login(token);
          } catch (error) {
            get().clearAuth();
          }
        }
      }
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        token: state.token,
        user: state.user
      })
    }
  )
);

export default useAuthStore;

// Made with Bob
