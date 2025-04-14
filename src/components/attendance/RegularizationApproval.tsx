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
import { format } from 'date-fns';

interface RegularizationRequest {
  _id: string;
  employee: {
    name: string;
    employeeId: string;
  };
  date: string;
  checkIn: string;
  checkOut: string;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  rejectionReason?: string;
}

const RegularizationApproval: React.FC = () => {
  const [requests, setRequests] = useState<RegularizationRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedRequest, setSelectedRequest] = useState<RegularizationRequest | null>(null);
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  const [reviewComment, setReviewComment] = useState('');

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

  const handleReviewClick = (request: RegularizationRequest) => {
    setSelectedRequest(request);
    setReviewDialogOpen(true);
  };

  const handleApprove = async () => {
    if (!selectedRequest) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/attendance/regularization/${selectedRequest._id}/status`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: 'approved',
          rejectionReason: reviewComment,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to approve regularization request');
      }

      setReviewDialogOpen(false);
      setSelectedRequest(null);
      setReviewComment('');
      fetchRequests();
    } catch (error) {
      setError('Error approving regularization request');
    }
  };

  const handleReject = async () => {
    if (!selectedRequest) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/attendance/regularization/${selectedRequest._id}/status`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: 'rejected',
          rejectionReason: reviewComment,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to reject regularization request');
      }

      setReviewDialogOpen(false);
      setSelectedRequest(null);
      setReviewComment('');
      fetchRequests();
    } catch (error) {
      setError('Error rejecting regularization request');
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
      <Typography variant="h5" gutterBottom>
        Regularization Approval
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {loading ? (
        <CircularProgress />
      ) : requests.length === 0 ? (
        <Alert severity="info">No pending regularization requests</Alert>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Employee</TableCell>
                <TableCell>Date</TableCell>
                <TableCell>Check In</TableCell>
                <TableCell>Check Out</TableCell>
                <TableCell>Reason</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {requests.map((request) => (
                <TableRow key={request._id}>
                  <TableCell>
                    {request.employee.name}
                    <Typography variant="caption" display="block">
                      ID: {request.employee.employeeId}
                    </Typography>
                  </TableCell>
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
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={() => handleReviewClick(request)}
                      disabled={request.status !== 'pending'}
                    >
                      Review
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Dialog open={reviewDialogOpen} onClose={() => setReviewDialogOpen(false)}>
        <DialogTitle>Review Regularization Request</DialogTitle>
        <DialogContent>
          {selectedRequest && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle1" gutterBottom>
                Employee: {selectedRequest.employee.name}
              </Typography>
              <Typography variant="subtitle1" gutterBottom>
                Date: {format(new Date(selectedRequest.date), 'MMM dd, yyyy')}
              </Typography>
              <Typography variant="subtitle1" gutterBottom>
                Check In: {selectedRequest.checkIn}
              </Typography>
              <Typography variant="subtitle1" gutterBottom>
                Check Out: {selectedRequest.checkOut}
              </Typography>
              <Typography variant="subtitle1" gutterBottom>
                Reason: {selectedRequest.reason}
              </Typography>
              <TextField
                fullWidth
                multiline
                rows={4}
                label="Review Comment"
                value={reviewComment}
                onChange={(e) => setReviewComment(e.target.value)}
                sx={{ mt: 2 }}
              />
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setReviewDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleReject} color="error">
            Reject
          </Button>
          <Button onClick={handleApprove} color="success">
            Approve
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default RegularizationApproval; 