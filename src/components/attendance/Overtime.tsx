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

interface OvertimeRequest {
  _id: string;
  date: string;
  startTime: string;
  endTime: string;
  totalHours: number;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  rate: number;
  amount: number;
  approvedBy?: {
    _id: string;
    firstName: string;
    lastName: string;
  };
  rejectionReason?: string;
}

const Overtime: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [requests, setRequests] = useState<OvertimeRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    date: null as Date | null,
    startTime: null as Date | null,
    endTime: null as Date | null,
    reason: '',
  });

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/overtime');
      const data = await response.json();
      setRequests(data);
    } catch (error) {
      setError('Error fetching overtime requests');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      const response = await fetch('/api/overtime', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          date: formData.date?.toISOString().split('T')[0],
          startTime: formData.startTime?.toTimeString().split(' ')[0],
          endTime: formData.endTime?.toTimeString().split(' ')[0],
          reason: formData.reason,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to submit request');
      }

      setOpen(false);
      setFormData({
        date: null,
        startTime: null,
        endTime: null,
        reason: '',
      });
      fetchRequests();
    } catch (error) {
      setError('Error submitting overtime request');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h5">Overtime Management</Typography>
        <Button variant="contained" color="primary" onClick={() => setOpen(true)}>
          Apply for Overtime
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Apply for Overtime</DialogTitle>
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
                label="Start Time"
                value={formData.startTime}
                onChange={(time) => setFormData({ ...formData, startTime: time })}
                sx={{ width: '100%', mb: 2 }}
              />
              <TimePicker
                label="End Time"
                value={formData.endTime}
                onChange={(time) => setFormData({ ...formData, endTime: time })}
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
              <TableCell>Start Time</TableCell>
              <TableCell>End Time</TableCell>
              <TableCell>Total Hours</TableCell>
              <TableCell>Rate</TableCell>
              <TableCell>Amount</TableCell>
              <TableCell>Reason</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Approved By</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {requests.map((request) => (
              <TableRow key={request._id}>
                <TableCell>{format(new Date(request.date), 'MMM dd, yyyy')}</TableCell>
                <TableCell>{request.startTime}</TableCell>
                <TableCell>{request.endTime}</TableCell>
                <TableCell>{request.totalHours.toFixed(2)}</TableCell>
                <TableCell>${request.rate.toFixed(2)}</TableCell>
                <TableCell>${request.amount.toFixed(2)}</TableCell>
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

export default Overtime; 