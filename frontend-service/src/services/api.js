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
  async streamChat(message, onChunkReceived) {
    const token = localStorage.getItem('token');
    const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/chatbot`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ message }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();

    while (true) {
      const { done, value } = await reader.read();
      if (done) {
        break;
      }
      const chunk = decoder.decode(value, { stream: true });
      onChunkReceived(chunk);
    }
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