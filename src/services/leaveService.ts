import axios from 'axios';
import { API_BASE_URL } from '../config';
import { getAuthToken } from '../utils/auth';

// Leave Type Interfaces
export interface LeaveType {
  _id: string;
  name: string;
  description: string;
  defaultDays: number;
  isPaid: boolean;
  isActive: boolean;
}

export interface CreateLeaveTypeData {
  name: string;
  description: string;
  defaultDays: number;
  isPaid: boolean;
}

export interface UpdateLeaveTypeData {
  name?: string;
  description?: string;
  defaultDays?: number;
  isPaid?: boolean;
  isActive?: boolean;
}

// Leave Application Interfaces
export interface LeaveApplication {
  _id: string;
  employee: {
    _id: string;
    firstName: string;
    lastName: string;
  };
  leaveType: {
    _id: string;
    name: string;
  };
  startDate: string;
  endDate: string;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  approvedBy?: {
    _id: string;
    firstName: string;
    lastName: string;
  };
  rejectionReason?: string;
}

export interface ApplyForLeaveData {
  leaveTypeId: string;
  startDate: Date;
  endDate: Date;
  reason: string;
}

// Create axios instance with auth token
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = getAuthToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Leave Type Services
export const leaveService = {
  getLeaveTypes: async (): Promise<LeaveType[]> => {
    const response = await api.get('/leave/types');
    return response.data;
  },

  createLeaveType: async (data: CreateLeaveTypeData): Promise<LeaveType> => {
    const response = await api.post('/leave/types', data);
    return response.data;
  },

  updateLeaveType: async (id: string, data: UpdateLeaveTypeData): Promise<LeaveType> => {
    const response = await api.put(`/leave/types/${id}`, data);
    return response.data;
  },

  deleteLeaveType: async (id: string): Promise<void> => {
    await api.delete(`/leave/types/${id}`);
  },

  // Leave Application Services
  getLeaveApplications: async (): Promise<LeaveApplication[]> => {
    const response = await api.get('/leave/applications');
    return response.data;
  },

  applyForLeave: async (data: ApplyForLeaveData): Promise<LeaveApplication> => {
    const response = await api.post('/leave/applications', data);
    return response.data;
  },

  updateLeaveStatus: async (id: string, status: 'approved' | 'rejected', rejectionReason?: string): Promise<LeaveApplication> => {
    const response = await api.put(`/leave/applications/${id}/status`, {
      status,
      rejectionReason,
    });
    return response.data;
  },
}; 