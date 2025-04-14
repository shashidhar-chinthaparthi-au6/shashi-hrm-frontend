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
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  CircularProgress,
  Chip,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers';
import { format } from 'date-fns';

interface RegularizationRequest {
  _id: string;
  date: string;
  checkIn: string;
  checkOut: string;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  approvedBy?: {
    name: string;
  };
  rejectionReason?: string;
  approvedAt?: string;
}

const AttendanceRegularization: React.FC = () => {
  const [requests, setRequests] = useState<RegularizationRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    date: null as Date | null,
    checkIn: '',
    checkOut: '',
    reason: '',
  });

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch('/api/attendance/regularization', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch regularization requests');
      }

      const data = await response.json();
      setRequests(data);
    } catch (error) {
      setError('Error fetching regularization requests');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/attendance/regularization', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          date: formData.date?.toISOString().split('T')[0],
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to submit regularization request');
      }

      setOpen(false);
      setFormData({
        date: null,
        checkIn: '',
        checkOut: '',
        reason: '',
      });
      fetchRequests();
    } catch (error) {
      setError('Error submitting regularization request');
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

      {loading ? (
        <CircularProgress />
      ) : (
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
                <TableCell>Rejection Reason</TableCell>
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
                    <Chip
                      label={request.status}
                      color={getStatusColor(request.status) as any}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    {request.approvedBy?.name || '-'}
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

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Apply for Attendance Regularization</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <DatePicker
              label="Date"
              value={formData.date}
              onChange={(date) => setFormData({ ...formData, date })}
              sx={{ mb: 2, width: '100%' }}
            />
            <TextField
              fullWidth
              label="Check In Time"
              type="time"
              value={formData.checkIn}
              onChange={(e) => setFormData({ ...formData, checkIn: e.target.value })}
              sx={{ mb: 2 }}
              InputLabelProps={{
                shrink: true,
              }}
              inputProps={{
                step: 300, // 5 min
              }}
            />
            <TextField
              fullWidth
              label="Check Out Time"
              type="time"
              value={formData.checkOut}
              onChange={(e) => setFormData({ ...formData, checkOut: e.target.value })}
              sx={{ mb: 2 }}
              InputLabelProps={{
                shrink: true,
              }}
              inputProps={{
                step: 300, // 5 min
              }}
            />
            <TextField
              fullWidth
              label="Reason"
              multiline
              rows={4}
              value={formData.reason}
              onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained" color="primary">
            Submit
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AttendanceRegularization; 