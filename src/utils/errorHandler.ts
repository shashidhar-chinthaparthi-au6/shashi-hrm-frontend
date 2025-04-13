import { logger } from './logger';
import { store } from '../store';
import { showToast } from '../store/toastSlice';

export interface ApiError {
  status: number;
  message: string;
  code?: string;
  details?: any;
}

export const errorMessages = {
  network: 'Network error. Please check your internet connection.',
  timeout: 'Request timed out. Please try again.',
  server: 'Server error. Please try again later.',
  auth: {
    invalidCredentials: 'Invalid email or password.',
    sessionExpired: 'Your session has expired. Please login again.',
    unauthorized: 'You are not authorized to perform this action.',
    tokenExpired: 'Your session has expired. Please login again.',
  },
  validation: {
    required: 'This field is required.',
    email: 'Please enter a valid email address.',
    password: 'Password must be at least 8 characters long.',
  },
  generic: 'An unexpected error occurred. Please try again.',
};

export const handleError = (error: any, context: string = '') => {
  logger.error(`Error in ${context}:`, error);

  if (error.response) {
    // The request was made and the server responded with a status code
    // that falls out of the range of 2xx
    const { status, data } = error.response;
    
    switch (status) {
      case 400:
        store.dispatch(showToast({
          message: data.message || errorMessages.validation.required,
          severity: 'error',
        }));
        break;
      case 401:
        if (data.message?.includes('token')) {
          store.dispatch(showToast({
            message: errorMessages.auth.tokenExpired,
            severity: 'error',
          }));
        } else {
          store.dispatch(showToast({
            message: errorMessages.auth.unauthorized,
            severity: 'error',
          }));
        }
        break;
      case 403:
        store.dispatch(showToast({
          message: errorMessages.auth.unauthorized,
          severity: 'error',
        }));
        break;
      case 404:
        store.dispatch(showToast({
          message: 'Resource not found.',
          severity: 'error',
        }));
        break;
      case 500:
        store.dispatch(showToast({
          message: errorMessages.server,
          severity: 'error',
        }));
        break;
      default:
        store.dispatch(showToast({
          message: data.message || errorMessages.generic,
          severity: 'error',
        }));
    }
  } else if (error.request) {
    // The request was made but no response was received
    if (error.code === 'ECONNABORTED') {
      store.dispatch(showToast({
        message: errorMessages.timeout,
        severity: 'error',
      }));
    } else {
      store.dispatch(showToast({
        message: errorMessages.network,
        severity: 'error',
      }));
    }
  } else {
    // Something happened in setting up the request that triggered an Error
    store.dispatch(showToast({
      message: error.message || errorMessages.generic,
      severity: 'error',
    }));
  }

  // Return a standardized error object
  return {
    status: error.response?.status || 0,
    message: error.response?.data?.message || error.message || errorMessages.generic,
    code: error.code,
    details: error.response?.data,
  } as ApiError;
}; 