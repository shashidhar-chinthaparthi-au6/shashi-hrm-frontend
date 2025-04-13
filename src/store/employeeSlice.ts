import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { employeeService, Employee } from '../services/employee.service';
import { showToast } from './toastSlice';

interface EmployeeState {
  employees: Employee[];
  loading: boolean;
  error: string | null;
}

const initialState: EmployeeState = {
  employees: [],
  loading: false,
  error: null,
};

export const fetchEmployees = createAsyncThunk(
  'employees/fetchAll',
  async (_, { rejectWithValue, dispatch }) => {
    try {
      const response = await employeeService.getAllEmployees();
      return response.data;
    } catch (error: any) {
      dispatch(showToast({ message: 'Failed to fetch employees', severity: 'error' }));
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch employees');
    }
  }
);

export const createEmployee = createAsyncThunk(
  'employees/create',
  async (employeeData: Omit<Employee, '_id' | 'directReports' | 'documents'>, { rejectWithValue, dispatch }) => {
    try {
      const response = await employeeService.createEmployee(employeeData);
      dispatch(showToast({ message: 'Employee created successfully', severity: 'success' }));
      return response.data;
    } catch (error: any) {
      dispatch(showToast({ message: 'Failed to create employee', severity: 'error' }));
      return rejectWithValue(error.response?.data?.message || 'Failed to create employee');
    }
  }
);

export const updateEmployee = createAsyncThunk(
  'employees/update',
  async ({ id, data }: { id: string; data: Omit<Employee, '_id' | 'directReports' | 'documents'> }, { rejectWithValue, dispatch }) => {
    try {
      const response = await employeeService.updateEmployee(id, data);
      dispatch(showToast({ message: 'Employee updated successfully', severity: 'success' }));
      return response.data;
    } catch (error: any) {
      dispatch(showToast({ message: 'Failed to update employee', severity: 'error' }));
      return rejectWithValue(error.response?.data?.message || 'Failed to update employee');
    }
  }
);

export const deleteEmployee = createAsyncThunk(
  'employees/delete',
  async (id: string, { rejectWithValue, dispatch }) => {
    try {
      await employeeService.deleteEmployee(id);
      dispatch(showToast({ message: 'Employee deleted successfully', severity: 'success' }));
      return id;
    } catch (error: any) {
      dispatch(showToast({ message: 'Failed to delete employee', severity: 'error' }));
      return rejectWithValue(error.response?.data?.message || 'Failed to delete employee');
    }
  }
);

const employeeSlice = createSlice({
  name: 'employees',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchEmployees.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchEmployees.fulfilled, (state, action) => {
        state.loading = false;
        state.employees = action.payload;
      })
      .addCase(fetchEmployees.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(createEmployee.fulfilled, (state, action) => {
        state.employees.push(action.payload);
      })
      .addCase(updateEmployee.fulfilled, (state, action) => {
        const index = state.employees.findIndex((emp) => emp._id === action.payload._id);
        if (index !== -1) {
          state.employees[index] = action.payload;
        }
      })
      .addCase(deleteEmployee.fulfilled, (state, action) => {
        state.employees = state.employees.filter((emp) => emp._id !== action.payload);
      });
  },
});

export default employeeSlice.reducer; 