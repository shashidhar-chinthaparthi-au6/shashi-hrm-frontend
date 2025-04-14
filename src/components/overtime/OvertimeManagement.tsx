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
  Chip,
  Alert,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
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
  rate: number;
  amount: number;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  approvedBy?: {
    firstName: string;
    lastName: string;
  };
  approvedAt?: string;
  rejectionReason?: string;
}

const OvertimeManagement: React.FC = () => {
  const [requests, setRequests] = useState<OvertimeRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    date: new Date(),
    startTime: new Date(),
    endTime: new Date(),
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

  const handleOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setFormData({
      date: new Date(),
      startTime: new Date(),
      endTime: new Date(),
      reason: '',
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/overtime', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          date: format(formData.date, 'yyyy-MM-dd'),
          startTime: format(formData.startTime, 'HH:mm'),
          endTime: format(formData.endTime, 'HH:mm'),
          reason: formData.reason,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to submit overtime request');
      }

      fetchRequests();
      handleClose();
    } catch (error) {
      setError('Error submitting overtime request');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'warning';
      case 'approved':
        return 'success';
      case 'rejected':
        return 'error';
      default:
        return 'default';
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h5">Overtime Management</Typography>
        <Button variant="contained" color="primary" onClick={handleOpen}>
          Apply for Overtime
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {loading ? (
        <CircularProgress />
      ) : (
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
                <TableCell>Rejection Reason</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {requests.map((request) => (
                <TableRow key={request._id}>
                  <TableCell>{format(new Date(request.date), 'MMM dd, yyyy')}</TableCell>
                  <TableCell>{request.startTime}</TableCell>
                  <TableCell>{request.endTime}</TableCell>
                  <TableCell>{request.totalHours.toFixed(2)}</TableCell>
                  <TableCell>{request.rate}x</TableCell>
                  <TableCell>${request.amount.toFixed(2)}</TableCell>
                  <TableCell>{request.reason}</TableCell>
                  <TableCell>
                    <Chip
                      label={request.status}
                      color={getStatusColor(request.status) as any}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    {request.approvedBy
                      ? `${request.approvedBy.firstName} ${request.approvedBy.lastName}`
                      : '-'}
                    {request.approvedAt && (
                      <Typography variant="caption" display="block">
                        {format(new Date(request.approvedAt), 'MMM dd, yyyy')}
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell>{request.rejectionReason || '-'}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>Apply for Overtime</DialogTitle>
        <DialogContent>
          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DatePicker
                label="Date"
                value={formData.date}
                onChange={(newValue) => newValue && setFormData({ ...formData, date: newValue })}
                sx={{ width: '100%', mb: 2 }}
              />
              <TimePicker
                label="Start Time"
                value={formData.startTime}
                onChange={(newValue) => newValue && setFormData({ ...formData, startTime: newValue })}
                sx={{ width: '100%', mb: 2 }}
              />
              <TimePicker
                label="End Time"
                value={formData.endTime}
                onChange={(newValue) => newValue && setFormData({ ...formData, endTime: newValue })}
                sx={{ width: '100%', mb: 2 }}
              />
            </LocalizationProvider>
            <TextField
              fullWidth
              multiline
              rows={3}
              label="Reason"
              value={formData.reason}
              onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
              required
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained" color="primary">
            Submit
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default OvertimeManagement; 