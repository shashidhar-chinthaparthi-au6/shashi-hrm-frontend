import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Alert,
  CircularProgress,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { format } from 'date-fns';

interface RegularizationRequest {
  _id: string;
  date: string;
  checkIn: string;
  checkOut: string;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  approvedBy?: {
    _id: string;
    firstName: string;
    lastName: string;
  };
  rejectionReason?: string;
}

const AttendanceRegularization: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [requests, setRequests] = useState<RegularizationRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    date: null as Date | null,
    checkIn: null as Date | null,
    checkOut: null as Date | null,
    reason: '',
  });

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/attendance-regularization');
      const data = await response.json();
      setRequests(data);
    } catch (error) {
      setError('Error fetching regularization requests');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      const response = await fetch('/api/attendance-regularization', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          date: formData.date?.toISOString().split('T')[0],
          checkIn: formData.checkIn?.toTimeString().split(' ')[0],
          checkOut: formData.checkOut?.toTimeString().split(' ')[0],
          reason: formData.reason,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to submit request');
      }

      setOpen(false);
      setFormData({
        date: null,
        checkIn: null,
        checkOut: null,
        reason: '',
      });
      fetchRequests();
    } catch (error) {
      setError('Error submitting regularization request');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h5">Attendance Regularization</Typography>
        <Button variant="contained" color="primary" onClick={() => setOpen(true)}>
          Apply for Regularization
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Apply for Attendance Regularization</DialogTitle>
        <DialogContent>
          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DatePicker
                label="Date"
                value={formData.date}
                onChange={(date) => setFormData({ ...formData, date })}
                sx={{ width: '100%', mb: 2 }}
              />
              <TimePicker
                label="Check In"
                value={formData.checkIn}
                onChange={(time) => setFormData({ ...formData, checkIn: time })}
                sx={{ width: '100%', mb: 2 }}
              />
              <TimePicker
                label="Check Out"
                value={formData.checkOut}
                onChange={(time) => setFormData({ ...formData, checkOut: time })}
                sx={{ width: '100%', mb: 2 }}
              />
            </LocalizationProvider>
            <TextField
              label="Reason"
              multiline
              rows={4}
              value={formData.reason}
              onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
              fullWidth
              required
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained" disabled={loading}>
            {loading ? <CircularProgress size={24} /> : 'Submit'}
          </Button>
        </DialogActions>
      </Dialog>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Date</TableCell>
              <TableCell>Check In</TableCell>
              <TableCell>Check Out</TableCell>
              <TableCell>Reason</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Approved By</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {requests.map((request) => (
              <TableRow key={request._id}>
                <TableCell>{format(new Date(request.date), 'MMM dd, yyyy')}</TableCell>
                <TableCell>{request.checkIn}</TableCell>
                <TableCell>{request.checkOut}</TableCell>
                <TableCell>{request.reason}</TableCell>
                <TableCell>
                  <Typography
                    color={
                      request.status === 'approved'
                        ? 'success.main'
                        : request.status === 'rejected'
                        ? 'error.main'
                        : 'warning.main'
                    }
                  >
                    {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                  </Typography>
                </TableCell>
                <TableCell>
                  {request.approvedBy
                    ? `${request.approvedBy.firstName} ${request.approvedBy.lastName}`
                    : '-'}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default AttendanceRegularization; 