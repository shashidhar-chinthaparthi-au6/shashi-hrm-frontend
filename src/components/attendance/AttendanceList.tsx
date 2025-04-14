import React, { useEffect, useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  Box,
  CircularProgress,
  Alert,
  Button
} from '@mui/material';
import { attendanceService, AttendanceRecord } from '../../services/attendanceService';
import { useAppSelector, useAppDispatch } from '../../store/hooks';
import { RootState } from '../../store';
import { logout } from '../../store/slices/authSlice';

const AttendanceList: React.FC = () => {
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const user = useAppSelector((state: RootState) => state.auth.user);
  const dispatch = useAppDispatch();

  useEffect(() => {
    const fetchAttendance = async () => {
      if (!user) {
        setLoading(false);
        setError('Please log in to view attendance records');
        return;
      }

      if (!user.id) {
        setLoading(false);
        setError('Invalid user data');
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const data = await attendanceService.getAttendance({
          employeeId: user.id,
        });
        setAttendance(data);
      } catch (error: any) {
        console.error('Error fetching attendance:', error);
        if (error.response?.status === 401) {
          setError('Your session has expired. Please log in again.');
          dispatch(logout());
        } else {
          setError('Failed to fetch attendance records');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchAttendance();
  }, [user, dispatch]);

  const handleRetry = () => {
    setError(null);
    setLoading(true);
    // The useEffect will trigger again due to loading state change
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 2 }}>
        <Alert 
          severity="error" 
          action={
            error.includes('session has expired') ? null : (
              <Button color="inherit" size="small" onClick={handleRetry}>
                Retry
              </Button>
            )
          }
        >
          {error}
        </Alert>
      </Box>
    );
  }

  if (!user) {
    return (
      <Box sx={{ p: 2 }}>
        <Alert severity="info">Please log in to view attendance records.</Alert>
      </Box>
    );
  }

  if (attendance.length === 0) {
    return (
      <Box sx={{ p: 2 }}>
        <Alert severity="info">No attendance records found.</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h6" gutterBottom>
        Attendance Records
      </Typography>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Date</TableCell>
              <TableCell>Check In</TableCell>
              <TableCell>Check Out</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Notes</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {attendance.map((record) => (
              <TableRow key={record._id}>
                <TableCell>{new Date(record.date).toLocaleDateString()}</TableCell>
                <TableCell>{record.checkIn ? new Date(record.checkIn).toLocaleTimeString() : '-'}</TableCell>
                <TableCell>{record.checkOut ? new Date(record.checkOut).toLocaleTimeString() : '-'}</TableCell>
                <TableCell>{record.status}</TableCell>
                <TableCell>{record.notes || '-'}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default AttendanceList; 