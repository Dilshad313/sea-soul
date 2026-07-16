// admin/src/services/api.js - UPDATED

import axios from 'axios';

// ✅ Use Vercel hosted backend URL
const API_URL = import.meta.env.VITE_API_URL || 'https://sea-soul-backend.vercel.app/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('adminToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Handle response errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('adminToken');
      localStorage.removeItem('adminUser');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// ✅ Webhook URL for MSG91 - Add this to your MSG91 widget settings
export const MSG91_WEBHOOK_URL = 'https://sea-soul-backend.vercel.app/api/otp-webhook';

export default api;