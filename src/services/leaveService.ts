import api from './api';

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

export interface UpdateLeaveTypeData extends Partial<CreateLeaveTypeData> {
  isActive?: boolean;
}

export const leaveService = {
  // Leave Types
  getLeaveTypes: async () => {
    const response = await api.get('/leaves/types');
    return response.data;
  },

  createLeaveType: async (data: CreateLeaveTypeData) => {
    const response = await api.post('/leaves/types', data);
    return response.data;
  },

  updateLeaveType: async (id: string, data: UpdateLeaveTypeData) => {
    const response = await api.put(`/leaves/types/${id}`, data);
    return response.data;
  },

  deleteLeaveType: async (id: string) => {
    const response = await api.delete(`/leaves/types/${id}`);
    return response.data;
  },
}; 