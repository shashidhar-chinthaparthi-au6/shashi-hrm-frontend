import axios from 'axios';
import { store } from '../store';

const API_URL = 'http://localhost:5000/api/attendance';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to include auth token
api.interceptors.request.use((config) => {
  const token = store.getState().auth.token || localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Add response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    if (error.response?.status === 401) {
      // Clear token and redirect to login
      localStorage.removeItem('token');
      store.dispatch({ type: 'auth/logout' });
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export interface AttendanceData {
  employeeId: string;
  date: string;
  checkIn: string;
  checkOut: string;
  status: 'present' | 'absent' | 'late' | 'half_day' | 'on_leave';
  notes: string;
}

export interface AttendanceRecord extends AttendanceData {
  _id: string;
  createdAt: string;
  updatedAt: string;
}

export interface AttendanceParams {
  employeeId?: string;
  startDate?: string;
  endDate?: string;
}

export interface AttendanceReportParams {
  employeeId?: string;
  month?: number;
  year?: number;
}

export const attendanceService = {
  markAttendance: async (data: AttendanceData): Promise<AttendanceRecord> => {
    try {
      console.log('Marking attendance with data:', data);
      const response = await api.post('', data);
      console.log('Attendance marked successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error marking attendance:', error);
      throw error;
    }
  },

  getAttendance: async (params: AttendanceParams): Promise<AttendanceRecord[]> => {
    try {
      console.log('Fetching attendance with params:', params);
      const response = await api.get('', { params });
      console.log('Attendance fetched successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching attendance:', error);
      throw error;
    }
  },

  updateAttendance: async (id: string, data: Partial<AttendanceData>): Promise<AttendanceRecord> => {
    try {
      console.log('Updating attendance with id:', id, 'and data:', data);
      const response = await api.put(`/${id}`, data);
      console.log('Attendance updated successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error updating attendance:', error);
      throw error;
    }
  },

  getAttendanceReport: async (params: AttendanceReportParams): Promise<any> => {
    try {
      console.log('Fetching attendance report with params:', params);
      const response = await api.get('/report', { params });
      console.log('Attendance report fetched successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching attendance report:', error);
      throw error;
    }
  },
}; 