import axios from 'axios';
import { LoginCredentials, RegisterData, AuthResponse } from '../types/auth';
import { logger } from '../utils/logger';
import { handleError } from '../utils/errorHandler';
import config from '../config';
import { logout } from '../store/authSlice';

// Create axios instance with base URL from config
const api = axios.create({
  baseURL: config.apiUrl,
  timeout: 10000,
  validateStatus: (status) => status < 500,
});

// Add a request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    logger.api.request(config.method?.toUpperCase() || 'GET', config.url || '', config.data);
    return config;
  },
  (error) => {
    logger.error('Request error:', error);
    return Promise.reject(error);
  }
);

// Add a response interceptor
api.interceptors.response.use(
  (response) => {
    logger.api.response(
      response.config.method?.toUpperCase() || 'GET',
      response.config.url || '',
      response.status,
      response.data
    );
    return response;
  },
  (error) => {
    logger.error(
      error.config?.method?.toUpperCase() || 'GET',
      error.config?.url || '',
      error
    );
    
    // Check if it's a 404 error and provide a more specific message
    if (error.response?.status === 404) {
      logger.error('API endpoint not found:', error.config?.url);
    }
    
    const handledError = handleError(error, 'API');
    
    if (error.response?.status === 401) {
      if (!['/auth/login', '/auth/register'].includes(error.config.url)) {
        const user = authService.getStoredUserData();
        logger.auth.sessionExpired(user?.email || 'unknown');
        authService.logout();
      }
    }
    
    return Promise.reject(handledError);
  }
);

export const authService = {
  register: async (userData: any, onSuccess?: (message: string) => void) => {
    try {
      const startTime = logger.performance.start('Registration');
      const response = await api.post('/auth/register', userData);
      
      if (response.status === 201) {
        onSuccess?.('Registration successful! Please login.');
        return response.data;
      }
      throw new Error('Registration failed');
    } catch (error) {
      handleError(error);
      throw error;
    }
  },

  login: async (credentials: any, onSuccess?: (message: string) => void) => {
    try {
      const startTime = logger.performance.start('Login');
      const response = await api.post('/auth/login', credentials);
      
      if (response.status === 200) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        onSuccess?.(`Welcome back, ${response.data.user.firstName}!`);
        return response.data;
      }
      throw new Error('Login failed');
    } catch (error) {
      handleError(error);
      throw error;
    }
  },

  getCurrentUser: async (): Promise<AuthResponse> => {
    const startTime = logger.performance.start('Get Current User');
    try {
      const response = await api.get<AuthResponse>('/auth/me');
      
      if (response.status === 404) {
        throw new Error('User endpoint not found');
      }
      
      logger.performance.end('Get Current User', startTime);
      return response.data;
    } catch (error: any) {
      logger.performance.end('Get Current User', startTime);
      throw error;
    }
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  setAuthToken: (token: string) => {
    localStorage.setItem('token', token);
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  },

  setUserData: (user: any) => {
    localStorage.setItem('user', JSON.stringify(user));
  },

  getStoredUserData: () => {
    const userData = localStorage.getItem('user');
    return userData ? JSON.parse(userData) : null;
  },

  isAuthenticated: () => {
    return !!localStorage.getItem('token');
  },
}; 