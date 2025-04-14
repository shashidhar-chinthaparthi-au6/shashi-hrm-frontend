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
  Alert,
  CircularProgress,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Switch,
  FormControlLabel,
} from '@mui/material';

interface LeaveType {
  _id: string;
  name: string;
  description: string;
  defaultDays: number;
  isPaid: boolean;
  createdAt: string;
  updatedAt: string;
}

const LeaveTypeManagement: React.FC = () => {
  const [leaveTypes, setLeaveTypes] = useState<LeaveType[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [selectedType, setSelectedType] = useState<LeaveType | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    defaultDays: 0,
    isPaid: true,
  });

  useEffect(() => {
    fetchLeaveTypes();
  }, []);

  const fetchLeaveTypes = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch('/api/leave/types', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Unauthorized: Please login again');
        }
        throw new Error('Failed to fetch leave types');
      }

      const data = await response.json();
      // Ensure data is an array
      setLeaveTypes(Array.isArray(data) ? data : []);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Error fetching leave types');
      setLeaveTypes([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  };

  const handleOpen = (type?: LeaveType) => {
    if (type) {
      setSelectedType(type);
      setFormData({
        name: type.name,
        description: type.description,
        defaultDays: type.defaultDays,
        isPaid: type.isPaid,
      });
    } else {
      setSelectedType(null);
      setFormData({
        name: '',
        description: '',
        defaultDays: 0,
        isPaid: true,
      });
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedType(null);
    setFormData({
      name: '',
      description: '',
      defaultDays: 0,
      isPaid: true,
    });
  };

  const handleSubmit = async () => {
    try {
      const url = selectedType
        ? `/api/leave/types/${selectedType._id}`
        : '/api/leave/types';
      const method = selectedType ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Failed to save leave type');
      }

      handleClose();
      fetchLeaveTypes();
    } catch (error) {
      setError('Error saving leave type');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this leave type?')) {
      return;
    }

    try {
      const response = await fetch(`/api/leave/types/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete leave type');
      }

      fetchLeaveTypes();
    } catch (error) {
      setError('Error deleting leave type');
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h5">Leave Types</Typography>
        <Button variant="contained" color="primary" onClick={() => handleOpen()}>
          Add Leave Type
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
                <TableCell>Name</TableCell>
                <TableCell>Description</TableCell>
                <TableCell>Default Days</TableCell>
                <TableCell>Paid Leave</TableCell>
                <TableCell>Created At</TableCell>
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
                  <TableCell>
                    {new Date(type.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <Button onClick={() => handleOpen(type)} sx={{ mr: 1 }}>
                      Edit
                    </Button>
                    <Button
                      color="error"
                      onClick={() => handleDelete(type._id)}
                    >
                      Delete
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>
          {selectedType ? 'Edit Leave Type' : 'Add Leave Type'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <TextField
              fullWidth
              label="Name"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="Description"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              multiline
              rows={3}
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="Default Days"
              type="number"
              value={formData.defaultDays}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  defaultDays: parseInt(e.target.value),
                })
              }
              sx={{ mb: 2 }}
            />
            <FormControlLabel
              control={
                <Switch
                  checked={formData.isPaid}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      isPaid: e.target.checked,
                    })
                  }
                />
              }
              label="Paid Leave"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained" color="primary">
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default LeaveTypeManagement; 