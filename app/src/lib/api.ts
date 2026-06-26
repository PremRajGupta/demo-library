import axios from 'axios';
import { apiUrl } from './apiConfig';

const api = axios.create({
  baseURL: apiUrl('/api'),
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 120000 // 120 second timeout for Render cold starts
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('demo_library_token');
    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Add cache-busting parameter to GET requests
    if (config.method === 'get' || config.method === 'GET') {
      config.params = config.params || {};
      config.params._t = Date.now();
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for better error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (!error.response) {
      // Network error or server unreachable
      const networkError = new Error(
        'Cannot connect to server. Make sure the backend is running on http://localhost:5000'
      );
      networkError.name = 'NetworkError';
      return Promise.reject(networkError);
    }
    return Promise.reject(error);
  }
);

export default api;
