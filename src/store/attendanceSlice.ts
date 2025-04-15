import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { attendanceService, AttendanceRecord, AttendanceSettings } from '../services/attendance.service';
import { showToast } from './toastSlice';

interface AttendanceState {
  records: AttendanceRecord[];
  settings: AttendanceSettings | null;
  loading: boolean;
  error: string | null;
}

const initialState: AttendanceState = {
  records: [],
  settings: null,
  loading: false,
  error: null,
};

export const fetchDailyAttendance = createAsyncThunk(
  'attendance/fetchDaily',
  async (date: string, { rejectWithValue, dispatch }) => {
    try {
      const response = await attendanceService.getDailyAttendance(date);
      return response;
    } catch (error: any) {
      dispatch(showToast({ message: 'Failed to fetch attendance records', severity: 'error' }));
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch attendance records');
    }
  }
);

export const updateAttendanceRecord = createAsyncThunk(
  'attendance/updateRecord',
  async ({ id, data }: { id: string; data: Partial<AttendanceRecord> }, { rejectWithValue, dispatch }) => {
    try {
      const response = await attendanceService.updateAttendanceRecord(id, data);
      dispatch(showToast({ message: 'Attendance record updated successfully', severity: 'success' }));
      return response;
    } catch (error: any) {
      dispatch(showToast({ message: 'Failed to update attendance record', severity: 'error' }));
      return rejectWithValue(error.response?.data?.message || 'Failed to update attendance record');
    }
  }
);

export const fetchAttendanceSettings = createAsyncThunk(
  'attendance/fetchSettings',
  async (_, { rejectWithValue, dispatch }) => {
    try {
      const response = await attendanceService.getSettings();
      return response;
    } catch (error: any) {
      dispatch(showToast({ message: 'Failed to fetch attendance settings', severity: 'error' }));
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch attendance settings');
    }
  }
);

export const updateAttendanceSettings = createAsyncThunk(
  'attendance/updateSettings',
  async (settings: AttendanceSettings, { rejectWithValue, dispatch }) => {
    try {
      const response = await attendanceService.updateSettings(settings);
      dispatch(showToast({ message: 'Attendance settings updated successfully', severity: 'success' }));
      return response;
    } catch (error: any) {
      dispatch(showToast({ message: 'Failed to update attendance settings', severity: 'error' }));
      return rejectWithValue(error.response?.data?.message || 'Failed to update attendance settings');
    }
  }
);

export const markAttendance = createAsyncThunk(
  'attendance/mark',
  async (data: { employeeId: string; date: string; checkIn: string; checkOut: string; status: string; notes: string }, { rejectWithValue, dispatch }) => {
    try {
      const response = await attendanceService.markAttendance(data);
      dispatch(showToast({ message: 'Attendance marked successfully', severity: 'success' }));
      return response;
    } catch (error: any) {
      dispatch(showToast({ message: error.response?.data?.message || 'Failed to mark attendance', severity: 'error' }));
      return rejectWithValue(error.response?.data?.message || 'Failed to mark attendance');
    }
  }
);

const attendanceSlice = createSlice({
  name: 'attendance',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Fetch Daily Attendance
      .addCase(fetchDailyAttendance.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDailyAttendance.fulfilled, (state, action) => {
        state.loading = false;
        state.records = action.payload;
      })
      .addCase(fetchDailyAttendance.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Update Attendance Record
      .addCase(updateAttendanceRecord.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateAttendanceRecord.fulfilled, (state, action) => {
        state.loading = false;
        const updatedRecord = action.payload;
        const index = state.records.findIndex(record => record._id === updatedRecord._id);
        if (index !== -1) {
          state.records[index] = updatedRecord;
        }
      })
      .addCase(updateAttendanceRecord.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Fetch Settings
      .addCase(fetchAttendanceSettings.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAttendanceSettings.fulfilled, (state, action) => {
        state.loading = false;
        state.settings = action.payload;
      })
      .addCase(fetchAttendanceSettings.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Update Settings
      .addCase(updateAttendanceSettings.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateAttendanceSettings.fulfilled, (state, action) => {
        state.loading = false;
        state.settings = action.payload;
      })
      .addCase(updateAttendanceSettings.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Mark Attendance
      .addCase(markAttendance.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(markAttendance.fulfilled, (state, action) => {
        state.loading = false;
        state.records = [...state.records, action.payload];
      })
      .addCase(markAttendance.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export default attendanceSlice.reducer; 