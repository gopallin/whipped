import { defineStore } from 'pinia';
import api from '../services/api';

export const useAuthStore = defineStore('auth', {
  state: () => ({
    token: localStorage.getItem('token') || null,
    user: null,
  }),
  getters: {
    isAuthenticated: (state) => !!state.token,
  },
  actions: {
    async login(credentials) {
      try {
        const response = await api.login(credentials);
        const token = response.data.access_token;
        this.token = token;
        localStorage.setItem('token', token);
        api.setAuthHeader(token);
        await this.fetchUser();
        return true;
      } catch (error) {
        console.error('Login failed:', error);
        return false;
      }
    },
    async register(user) {
      try {
        await api.register(user);
        return true;
      } catch (error) {
        console.error('Registration failed:', error);
        return false;
      }
    },
    async fetchUser() {
        if (this.token) {
            try {
                const response = await api.getMe();
                this.user = response.data;
            } catch (error) {
                console.error('Failed to fetch user:', error);
                this.logout();
            }
        }
    },
    logout() {
      this.token = null;
      this.user = null;
      localStorage.removeItem('token');
      api.removeAuthHeader();
    },
  },
});
