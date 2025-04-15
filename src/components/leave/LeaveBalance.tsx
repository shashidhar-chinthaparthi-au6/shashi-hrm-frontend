import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Alert,
  CircularProgress,
  Card,
  CardContent,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  SelectChangeEvent,
} from '@mui/material';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import { AuthState } from '../../store/slices/authSlice';

interface LeaveBalance {
  _id: string;
  employee: {
    _id: string;
    firstName: string;
    lastName: string;
  };
  leaveType: {
    _id: string;
    name: string;
    description: string;
    defaultDays: number;
    isPaid: boolean;
  };
  totalDays: number;
  usedDays: number;
  remainingDays: number;
  year: number;
}

const LeaveBalance: React.FC = () => {
  const [balances, setBalances] = useState<LeaveBalance[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedEmployee, setSelectedEmployee] = useState<string>('');
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [employees, setEmployees] = useState<{ _id: string; firstName: string; lastName: string }[]>([]);
  const [employeesLoading, setEmployeesLoading] = useState(false);
  const [employeesError, setEmployeesError] = useState<string | null>(null);

  const { user } = useSelector((state: RootState) => state.auth as AuthState);
  const isAdmin = ['SUPER_ADMIN', 'ADMIN', 'HR_MANAGER'].includes(user?.role || '');

  useEffect(() => {
    fetchEmployees();
    fetchBalances();
  }, [selectedEmployee, selectedYear]);

  const fetchEmployees = async () => {
    try {
      setEmployeesLoading(true);
      setEmployeesError(null);
      const token = localStorage.getItem('token');
      const response = await fetch('/api/employees', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      const data = await response.json();
      // Ensure data is an array
      setEmployees(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching employees:', error);
      setEmployeesError('Error fetching employees');
      setEmployees([]); // Reset employees on error
    } finally {
      setEmployeesLoading(false);
    }
  };

  const fetchBalances = async () => {
    try {
      setLoading(true);
      let url = '/api/leave/balances';
      const params = new URLSearchParams();
      if (selectedEmployee) params.append('employeeId', selectedEmployee);
      if (selectedYear) params.append('year', selectedYear.toString());
      if (params.toString()) url += `?${params.toString()}`;
      const token = localStorage.getItem('token');
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      const data = await response.json();
      // Ensure data is an array
      setBalances(Array.isArray(data) ? data : []);
    } catch (error) {
      setError('Error fetching leave balances');
      setBalances([]); // Reset balances on error
    } finally {
      setLoading(false);
    }
  };

  const handleEmployeeChange = (event: SelectChangeEvent) => {
    setSelectedEmployee(event.target.value);
  };

  const handleYearChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedYear(parseInt(event.target.value));
  };

  const getProgressColor = (used: number, total: number) => {
    const percentage = (used / total) * 100;
    if (percentage >= 90) return 'error';
    if (percentage >= 70) return 'warning';
    return 'success';
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" sx={{ mb: 3 }}>
        Leave Balance
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {isAdmin && (
        <Box sx={{ mb: 3, display: 'flex', gap: 2 }}>
          <FormControl sx={{ minWidth: 200 }}>
            <InputLabel>Select Employee</InputLabel>
            <Select
              value={selectedEmployee}
              onChange={handleEmployeeChange}
              label="Select Employee"
              disabled={employeesLoading}
            >
              <MenuItem value="">All Employees</MenuItem>
              {employees.map((employee) => (
                <MenuItem key={employee._id} value={employee._id}>
                  {employee.firstName} {employee.lastName}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            label="Year"
            type="number"
            value={selectedYear}
            onChange={handleYearChange}
            sx={{ width: 120 }}
          />
        </Box>
      )}

      {employeesError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {employeesError}
        </Alert>
      )}

      {loading ? (
        <CircularProgress />
      ) : balances.length === 0 ? (
        <Alert severity="info">No leave balance records found</Alert>
      ) : (
        <>
          <Grid container spacing={3} sx={{ mb: 3 }}>
            {balances.map((balance) => (
              <Grid item xs={12} sm={6} md={4} key={balance._id}>
                <Card>
                  <CardContent>
                    {isAdmin && (
                      <Typography variant="subtitle1" gutterBottom>
                        {balance.employee.firstName} {balance.employee.lastName}
                      </Typography>
                    )}
                    <Typography variant="h6" gutterBottom>
                      {balance.leaveType.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      {balance.leaveType.description}
                    </Typography>
                    <Box sx={{ mt: 2 }}>
                      <Typography variant="body2">
                        Total Days: {balance.totalDays}
                      </Typography>
                      <Typography variant="body2">
                        Used Days: {balance.usedDays}
                      </Typography>
                      <Typography
                        variant="body2"
                        color={getProgressColor(balance.usedDays, balance.totalDays)}
                      >
                        Remaining Days: {balance.remainingDays}
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>

          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  {isAdmin && <TableCell>Employee</TableCell>}
                  <TableCell>Leave Type</TableCell>
                  <TableCell>Total Days</TableCell>
                  <TableCell>Used Days</TableCell>
                  <TableCell>Remaining Days</TableCell>
                  <TableCell>Year</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {balances.map((balance) => (
                  <TableRow key={balance._id}>
                    {isAdmin && (
                      <TableCell>
                        {balance.employee.firstName} {balance.employee.lastName}
                      </TableCell>
                    )}
                    <TableCell>{balance.leaveType.name}</TableCell>
                    <TableCell>{balance.totalDays}</TableCell>
                    <TableCell>{balance.usedDays}</TableCell>
                    <TableCell
                      sx={{
                        color: getProgressColor(balance.usedDays, balance.totalDays),
                      }}
                    >
                      {balance.remainingDays}
                    </TableCell>
                    <TableCell>{balance.year}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </>
      )}
    </Box>
  );
};

export default LeaveBalance; 