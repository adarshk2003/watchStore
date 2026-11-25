import axios from 'axios';
import { API_BASE_URL } from './api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 45000, // accommodate Render free-tier cold starts
});

apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token.trim()}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear expired auth session
      localStorage.removeItem('authToken');
      localStorage.removeItem('userId');
      localStorage.removeItem('userType');
      localStorage.removeItem('role');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;
