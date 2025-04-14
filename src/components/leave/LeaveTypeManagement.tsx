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
  Switch,
  FormControlLabel,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  CircularProgress,
  Alert,
} from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { leaveService, LeaveType, CreateLeaveTypeData } from '../../services/leaveService';

const LeaveTypeManagement: React.FC = () => {
  const [leaveTypes, setLeaveTypes] = useState<LeaveType[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingType, setEditingType] = useState<LeaveType | null>(null);
  const [formData, setFormData] = useState<CreateLeaveTypeData>({
    name: '',
    description: '',
    defaultDays: 0,
    isPaid: true,
  });

  const fetchLeaveTypes = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await leaveService.getLeaveTypes();
      setLeaveTypes(data);
    } catch (err) {
      setError('Failed to fetch leave types');
      console.error('Error fetching leave types:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaveTypes();
  }, []);

  const handleOpenDialog = (type?: LeaveType) => {
    if (type) {
      setEditingType(type);
      setFormData({
        name: type.name,
        description: type.description,
        defaultDays: type.defaultDays,
        isPaid: type.isPaid,
      });
    } else {
      setEditingType(null);
      setFormData({
        name: '',
        description: '',
        defaultDays: 0,
        isPaid: true,
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingType(null);
    setFormData({
      name: '',
      description: '',
      defaultDays: 0,
      isPaid: true,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);
      if (editingType) {
        await leaveService.updateLeaveType(editingType._id, formData);
      } else {
        await leaveService.createLeaveType(formData);
      }
      handleCloseDialog();
      fetchLeaveTypes();
    } catch (err) {
      setError('Failed to save leave type');
      console.error('Error saving leave type:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this leave type?')) {
      return;
    }
    try {
      setLoading(true);
      setError(null);
      await leaveService.deleteLeaveType(id);
      fetchLeaveTypes();
    } catch (err) {
      setError('Failed to delete leave type');
      console.error('Error deleting leave type:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5">Leave Types</Typography>
        <Button variant="contained" color="primary" onClick={() => handleOpenDialog()}>
          Add Leave Type
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {loading ? (
        <Box display="flex" justifyContent="center" p={3}>
          <CircularProgress />
        </Box>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Description</TableCell>
                <TableCell>Default Days</TableCell>
                <TableCell>Paid</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {leaveTypes.map((type) => (
                <TableRow key={type._id}>
                  <TableCell>{type.name}</TableCell>
                  <TableCell>{type.description}</TableCell>
                  <TableCell>{type.defaultDays}</TableCell>
                  <TableCell>{type.isPaid ? 'Yes' : 'No'}</TableCell>
                  <TableCell>{type.isActive ? 'Active' : 'Inactive'}</TableCell>
                  <TableCell>
                    <IconButton onClick={() => handleOpenDialog(type)}>
                      <EditIcon />
                    </IconButton>
                    <IconButton onClick={() => handleDelete(type._id)}>
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>{editingType ? 'Edit Leave Type' : 'Add Leave Type'}</DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent>
            <TextField
              fullWidth
              label="Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              margin="normal"
              required
            />
            <TextField
              fullWidth
              label="Description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              margin="normal"
              multiline
              rows={3}
            />
            <TextField
              fullWidth
              label="Default Days"
              type="number"
              value={formData.defaultDays}
              onChange={(e) => setFormData({ ...formData, defaultDays: Number(e.target.value) })}
              margin="normal"
              required
            />
            <FormControlLabel
              control={
                <Switch
                  checked={formData.isPaid}
                  onChange={(e) => setFormData({ ...formData, isPaid: e.target.checked })}
                />
              }
              label="Paid Leave"
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Cancel</Button>
            <Button type="submit" variant="contained" color="primary" disabled={loading}>
              {editingType ? 'Update' : 'Create'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
};

export default LeaveTypeManagement; 