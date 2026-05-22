import axios from 'axios';

const apiBaseUrl = import.meta.env.VITE_ADMIN_API_BASE_URL || import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

const api = axios.create({
  baseURL: `${apiBaseUrl.replace(/\/$/, '')}/api/admin`,
});
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('adminToken');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});
api.interceptors.response.use(r => r, (error) => {
  if (error.response?.status === 401) { localStorage.removeItem('adminToken'); localStorage.removeItem('adminUser'); window.location.href = '/login'; }
  return Promise.reject(error);
});
export default api;
