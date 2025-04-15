import api from './api';

export interface AttendanceRecord {
  _id: string;
  employeeId: string;
  employeeName: string;
  date: string;
  checkIn: string;
  checkOut: string;
  status: 'present' | 'absent' | 'late' | 'half-day';
  notes?: string;
}

export interface AttendanceSettings {
  workHours: {
    start: string;
    end: string;
  };
  lateThreshold: number;
  halfDayThreshold: number;
}

export const attendanceService = {
  // Get attendance records for a specific date
  getDailyAttendance: async (date: string) => {
    const response = await api.get(`/attendance/daily/${date}`);
    return response.data;
  },

  // Get attendance records for a date range
  getAttendanceReport: async (startDate: string, endDate: string) => {
    const response = await api.get(`/attendance/report`, {
      params: { startDate, endDate }
    });
    return response.data;
  },

  // Update an attendance record
  updateAttendanceRecord: async (recordId: string, data: Partial<AttendanceRecord>) => {
    const response = await api.put(`/attendance/${recordId}`, data);
    return response.data;
  },

  // Get attendance settings
  getSettings: async () => {
    const response = await api.get('/attendance/settings');
    return response.data;
  },

  // Update attendance settings
  updateSettings: async (settings: AttendanceSettings) => {
    const response = await api.put('/attendance/settings', settings);
    return response.data;
  },

  // Generate and download attendance report
  downloadReport: async (startDate: string, endDate: string) => {
    const response = await api.get('/attendance/report/download', {
      params: { startDate, endDate },
      responseType: 'blob'
    });
    return response.data;
  }
}; 