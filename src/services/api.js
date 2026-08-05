import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  // Explicit Authorization (e.g. staff self-service) wins
  if (config.headers?.Authorization) {
    return config;
  }

  const adminToken = localStorage.getItem('kra_token');
  const staffToken = localStorage.getItem('kra_staff_token');
  const token = adminToken || staffToken;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
