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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  CircularProgress,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { leaveService, LeaveApplication, LeaveType } from '../../services/leaveService';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import { AuthState } from '../../store/slices/authSlice';

interface LeaveApplicationForm {
  leaveTypeId: string;
  startDate: Date | null;
  endDate: Date | null;
  reason: string;
}

const LeaveApplications: React.FC = () => {
  const [applications, setApplications] = useState<LeaveApplication[]>([]);
  const [leaveTypes, setLeaveTypes] = useState<LeaveType[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState<LeaveApplication | null>(null);
  const [reviewComment, setReviewComment] = useState('');
  const [formData, setFormData] = useState<LeaveApplicationForm>({
    leaveTypeId: '',
    startDate: null,
    endDate: null,
    reason: '',
  });

  const { user } = useSelector((state: RootState) => state.auth as AuthState);
  const isAdmin = ['SUPER_ADMIN', 'ADMIN', 'HR_MANAGER'].includes(user?.role || '');

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [apps, types] = await Promise.all([
        leaveService.getLeaveApplications(),
        leaveService.getLeaveTypes(),
      ]);
      setApplications(apps);
      setLeaveTypes(types);
    } catch (err) {
      setError('Failed to fetch data');
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenDialog = () => {
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setFormData({
      leaveTypeId: '',
      startDate: null,
      endDate: null,
      reason: '',
    });
  };

  const handleSubmit = async () => {
    try {
      if (!formData.leaveTypeId || !formData.startDate || !formData.endDate || !formData.reason) {
        setError('Please fill in all fields');
        return;
      }

      await leaveService.applyForLeave({
        leaveTypeId: formData.leaveTypeId,
        startDate: formData.startDate,
        endDate: formData.endDate,
        reason: formData.reason,
      });

      handleCloseDialog();
      fetchData();
    } catch (err) {
      setError('Failed to apply for leave');
      console.error('Error applying for leave:', err);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'success.main';
      case 'rejected':
        return 'error.main';
      default:
        return 'warning.main';
    }
  };

  const handleReviewClick = (application: LeaveApplication) => {
    setSelectedApplication(application);
    setReviewDialogOpen(true);
  };

  const handleApprove = async () => {
    if (!selectedApplication) return;

    try {
      await leaveService.updateLeaveStatus(selectedApplication._id, 'approved', reviewComment);
      fetchData();
      setReviewDialogOpen(false);
      setSelectedApplication(null);
      setReviewComment('');
    } catch (err) {
      setError('Error approving leave request');
    }
  };

  const handleReject = async () => {
    if (!selectedApplication) return;

    try {
      await leaveService.updateLeaveStatus(selectedApplication._id, 'rejected', reviewComment);
      fetchData();
      setReviewDialogOpen(false);
      setSelectedApplication(null);
      setReviewComment('');
    } catch (err) {
      setError('Error rejecting leave request');
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" p={3}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h6">{isAdmin ? 'Leave Applications' : 'My Leave Applications'}</Typography>
        <Button variant="contained" color="primary" onClick={handleOpenDialog}>
          Apply for Leave
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              {isAdmin && <TableCell>Employee</TableCell>}
              <TableCell>Leave Type</TableCell>
              <TableCell>Start Date</TableCell>
              <TableCell>End Date</TableCell>
              <TableCell>Reason</TableCell>
              <TableCell>Status</TableCell>
              {isAdmin && <TableCell>Actions</TableCell>}
            </TableRow>
          </TableHead>
          <TableBody>
            {applications.map((app) => (
              <TableRow key={app._id}>
                {isAdmin && (
                  <TableCell>
                    {app.employee.firstName} {app.employee.lastName}
                  </TableCell>
                )}
                <TableCell>{app.leaveType.name}</TableCell>
                <TableCell>{new Date(app.startDate).toLocaleDateString()}</TableCell>
                <TableCell>{new Date(app.endDate).toLocaleDateString()}</TableCell>
                <TableCell>{app.reason}</TableCell>
                <TableCell>
                  <Typography color={getStatusColor(app.status)}>
                    {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
                  </Typography>
                </TableCell>
                {isAdmin && (
                  <TableCell>
                    {app.status === 'pending' && (
                      <Button
                        variant="outlined"
                        size="small"
                        onClick={() => handleReviewClick(app)}
                      >
                        Review
                      </Button>
                    )}
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>Apply for Leave</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <FormControl fullWidth>
              <InputLabel>Leave Type</InputLabel>
              <Select
                value={formData.leaveTypeId}
                label="Leave Type"
                onChange={(e) => setFormData({ ...formData, leaveTypeId: e.target.value })}
              >
                {leaveTypes.map((type) => (
                  <MenuItem key={type._id} value={type._id}>
                    {type.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DatePicker
                label="Start Date"
                value={formData.startDate}
                onChange={(date) => setFormData({ ...formData, startDate: date })}
              />
              <DatePicker
                label="End Date"
                value={formData.endDate}
                onChange={(date) => setFormData({ ...formData, endDate: date })}
              />
            </LocalizationProvider>

            <TextField
              label="Reason"
              multiline
              rows={4}
              value={formData.reason}
              onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained" color="primary">
            Submit
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={reviewDialogOpen} onClose={() => setReviewDialogOpen(false)}>
        <DialogTitle>Review Leave Request</DialogTitle>
        <DialogContent>
          {selectedApplication && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle1" gutterBottom>
                Employee: {selectedApplication.employee.firstName} {selectedApplication.employee.lastName}
              </Typography>
              <Typography variant="subtitle1" gutterBottom>
                Leave Type: {selectedApplication.leaveType.name}
              </Typography>
              <Typography variant="subtitle1" gutterBottom>
                Period: {new Date(selectedApplication.startDate).toLocaleDateString()} -{' '}
                {new Date(selectedApplication.endDate).toLocaleDateString()}
              </Typography>
              <Typography variant="subtitle1" gutterBottom>
                Reason: {selectedApplication.reason}
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

export default LeaveApplications; 