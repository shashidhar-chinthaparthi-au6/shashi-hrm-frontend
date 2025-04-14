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
  CircularProgress,
  Alert,
  Chip,
} from '@mui/material';
import { format } from 'date-fns';

interface LeaveRequest {
  _id: string;
  employee: {
    _id: string;
    name: string;
    employeeId: string;
  };
  leaveType: {
    _id: string;
    name: string;
  };
  startDate: string;
  endDate: string;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
}

const LeaveApproval: React.FC = () => {
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedRequest, setSelectedRequest] = useState<LeaveRequest | null>(null);
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  const [reviewComment, setReviewComment] = useState('');

  useEffect(() => {
    fetchLeaveRequests();
  }, []);

  const fetchLeaveRequests = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/leaves/pending');
      const data = await response.json();
      setLeaveRequests(data);
    } catch (error) {
      setError('Error fetching leave requests');
    } finally {
      setLoading(false);
    }
  };

  const handleReviewClick = (request: LeaveRequest) => {
    setSelectedRequest(request);
    setReviewDialogOpen(true);
  };

  const handleApprove = async () => {
    if (!selectedRequest) return;

    try {
      const response = await fetch(`/api/leaves/${selectedRequest._id}/approve`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ comment: reviewComment }),
      });

      if (response.ok) {
        fetchLeaveRequests();
        setReviewDialogOpen(false);
        setSelectedRequest(null);
        setReviewComment('');
      } else {
        setError('Error approving leave request');
      }
    } catch (error) {
      setError('Error approving leave request');
    }
  };

  const handleReject = async () => {
    if (!selectedRequest) return;

    try {
      const response = await fetch(`/api/leaves/${selectedRequest._id}/reject`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ comment: reviewComment }),
      });

      if (response.ok) {
        fetchLeaveRequests();
        setReviewDialogOpen(false);
        setSelectedRequest(null);
        setReviewComment('');
      } else {
        setError('Error rejecting leave request');
      }
    } catch (error) {
      setError('Error rejecting leave request');
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
    <Box>
      <Typography variant="h5" gutterBottom>
        Leave Approval
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
          <CircularProgress />
        </Box>
      ) : leaveRequests.length === 0 ? (
        <Alert severity="info">No pending leave requests</Alert>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Employee</TableCell>
                <TableCell>Leave Type</TableCell>
                <TableCell>Start Date</TableCell>
                <TableCell>End Date</TableCell>
                <TableCell>Reason</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {leaveRequests.map((request) => (
                <TableRow key={request._id}>
                  <TableCell>
                    {request.employee.name}
                    <Typography variant="caption" display="block">
                      ID: {request.employee.employeeId}
                    </Typography>
                  </TableCell>
                  <TableCell>{request.leaveType.name}</TableCell>
                  <TableCell>{format(new Date(request.startDate), 'MMM dd, yyyy')}</TableCell>
                  <TableCell>{format(new Date(request.endDate), 'MMM dd, yyyy')}</TableCell>
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
        <DialogTitle>Review Leave Request</DialogTitle>
        <DialogContent>
          {selectedRequest && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle1" gutterBottom>
                Employee: {selectedRequest.employee.name}
              </Typography>
              <Typography variant="subtitle1" gutterBottom>
                Leave Type: {selectedRequest.leaveType.name}
              </Typography>
              <Typography variant="subtitle1" gutterBottom>
                Period: {format(new Date(selectedRequest.startDate), 'MMM dd, yyyy')} -{' '}
                {format(new Date(selectedRequest.endDate), 'MMM dd, yyyy')}
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

export default LeaveApproval; 