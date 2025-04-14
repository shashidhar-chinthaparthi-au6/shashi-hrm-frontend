import React, { useState } from 'react';
import {
  Box,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
} from '@mui/material';
import { useAppSelector } from '../../store/hooks';
import { attendanceService, AttendanceData } from '../../services/attendanceService';
import { RootState } from '../../store';

type AttendanceStatus = 'present' | 'absent' | 'late' | 'half_day' | 'on_leave';

const AttendanceForm: React.FC = () => {
  const [formData, setFormData] = useState<{
    date: string;
    checkIn: string;
    checkOut: string;
    status: AttendanceStatus;
    notes: string;
  }>({
    date: new Date().toISOString().split('T')[0],
    checkIn: '',
    checkOut: '',
    status: 'present',
    notes: '',
  });

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const user = useAppSelector((state: RootState) => state.auth.user);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    
    if (!user) {
      setError('User not authenticated');
      return;
    }

    if (!user.id) {
      setError('Invalid user data');
      return;
    }

    if (!formData.checkIn) {
      setError('Check-in time is required');
      return;
    }

    try {
      const attendanceData: AttendanceData = {
        employeeId: user.id,
        ...formData,
      };
      
      console.log('Submitting attendance data:', attendanceData);
      await attendanceService.markAttendance(attendanceData);
      
      // Reset form after successful submission
      setFormData({
        date: new Date().toISOString().split('T')[0],
        checkIn: '',
        checkOut: '',
        status: 'present',
        notes: '',
      });
      setSuccess('Attendance marked successfully');
    } catch (error: any) {
      console.error('Error marking attendance:', error);
      setError(error.response?.data?.message || 'Failed to mark attendance');
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ display: 'grid', gap: 2 }}>
      {error && <Alert severity="error">{error}</Alert>}
      {success && <Alert severity="success">{success}</Alert>}
      
      <TextField
        fullWidth
        type="date"
        label="Date"
        value={formData.date}
        onChange={(e) => setFormData({ ...formData, date: e.target.value })}
        InputLabelProps={{ shrink: true }}
        required
      />
      <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
        <TextField
          fullWidth
          type="time"
          label="Check In"
          value={formData.checkIn}
          onChange={(e) => setFormData({ ...formData, checkIn: e.target.value })}
          InputLabelProps={{ shrink: true }}
          required
        />
        <TextField
          fullWidth
          type="time"
          label="Check Out"
          value={formData.checkOut}
          onChange={(e) => setFormData({ ...formData, checkOut: e.target.value })}
          InputLabelProps={{ shrink: true }}
        />
      </Box>
      <FormControl fullWidth>
        <InputLabel>Status</InputLabel>
        <Select
          value={formData.status}
          label="Status"
          onChange={(e) => setFormData({ ...formData, status: e.target.value as AttendanceStatus })}
        >
          <MenuItem value="present">Present</MenuItem>
          <MenuItem value="absent">Absent</MenuItem>
          <MenuItem value="late">Late</MenuItem>
          <MenuItem value="half_day">Half Day</MenuItem>
          <MenuItem value="on_leave">On Leave</MenuItem>
        </Select>
      </FormControl>
      <TextField
        fullWidth
        multiline
        rows={3}
        label="Notes"
        value={formData.notes}
        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
      />
      <Button 
        type="submit" 
        variant="contained" 
        color="primary" 
        fullWidth
        disabled={!user?.id}
      >
        Mark Attendance
      </Button>
    </Box>
  );
};

export default AttendanceForm; 