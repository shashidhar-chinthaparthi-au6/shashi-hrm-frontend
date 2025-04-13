import axios from 'axios';
import config from '../config';

const api = axios.create({
  baseURL: config.apiUrl,
  timeout: 10000,
});

// Add a request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export interface Address {
  street: string;
  city: string;
  state: string;
  country: string;
  zipCode: string;
}

export interface EmergencyContact {
  name: string;
  relationship: string;
  phone: string;
}

export interface Employee {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  department: string;
  position: string;
  role: string;
  salary: number;
  managerId?: string;
  directReports?: string[];
  joiningDate: string;
  status: 'active' | 'inactive' | 'on_leave';
  address: Address;
  emergencyContact: EmergencyContact;
  documents?: {
    id: string;
    name: string;
    type: string;
    url: string;
    uploadedAt: string;
  }[];
}

export const employeeService = {
  getAllEmployees: async () => {
    const response = await api.get('/employees');
    return response;
  },

  getEmployeeById: async (id: string) => {
    const response = await api.get(`/employees/${id}`);
    return response;
  },

  createEmployee: async (employeeData: Omit<Employee, '_id'>) => {
    try {
      console.log('Sending employee data to server:', employeeData);
      const response = await api.post('/employees', employeeData);
      return response;
    } catch (error: any) {
      console.error('Error creating employee:', error.response?.data);
      throw error;
    }
  },

  updateEmployee: async (id: string, employeeData: Partial<Employee>) => {
    const response = await api.put(`/employees/${id}`, employeeData);
    return response;
  },

  deleteEmployee: async (id: string) => {
    const response = await api.delete(`/employees/${id}`);
    return response;
  },

  getEmployeesByDepartment: async (departmentId: string) => {
    const response = await api.get(`/employees/department/${departmentId}`);
    return response;
  },

  getDirectReports: async (managerId: string) => {
    const response = await api.get(`/employees/manager/${managerId}`);
    return response;
  },

  uploadDocument: async (employeeId: string, formData: FormData) => {
    const response = await api.post(`/employees/${employeeId}/documents`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response;
  },

  getDocuments: async (employeeId: string) => {
    const response = await api.get(`/employees/${employeeId}/documents`);
    return response;
  },

  deleteDocument: async (employeeId: string, documentId: string) => {
    const response = await api.delete(`/employees/${employeeId}/documents/${documentId}`);
    return response;
  },
}; 