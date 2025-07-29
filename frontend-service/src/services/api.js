import axios from 'axios';

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

const api = {
  setAuthHeader(token) {
    apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  },
  removeAuthHeader() {
    delete apiClient.defaults.headers.common['Authorization'];
  },
  sendMessage(message) {
    return apiClient.post('/api/chatbot', { message });
  },
  register(user) {
    return apiClient.post('/api/user/register', user);
  },
  login(credentials) {
    return apiClient.post('/api/user/login', credentials);
  },
  getMe() {
    return apiClient.get('/api/user/me');
  },
};

// Set auth header on initial load if token exists
const token = localStorage.getItem('token');
if (token) {
  api.setAuthHeader(token);
}

export default api;