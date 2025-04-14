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
  IconButton,
  Switch,
  Alert,
  CircularProgress,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';

interface Shift {
  _id: string;
  name: string;
  startTime: string;
  endTime: string;
  breakTime: number;
  graceTime: number;
  isActive: boolean;
  createdBy: {
    firstName: string;
    lastName: string;
  };
  updatedBy: {
    firstName: string;
    lastName: string;
  };
}

const ShiftManagement: React.FC = () => {
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [editingShift, setEditingShift] = useState<Shift | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    startTime: new Date(),
    endTime: new Date(),
    breakTime: 60,
    graceTime: 15,
  });

  useEffect(() => {
    fetchShifts();
  }, []);

  const fetchShifts = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/shifts');
      const data = await response.json();
      setShifts(data);
    } catch (error) {
      setError('Error fetching shifts');
    } finally {
      setLoading(false);
    }
  };

  const handleOpen = (shift?: Shift) => {
    if (shift) {
      setEditingShift(shift);
      setFormData({
        name: shift.name,
        startTime: new Date(`2000-01-01T${shift.startTime}`),
        endTime: new Date(`2000-01-01T${shift.endTime}`),
        breakTime: shift.breakTime,
        graceTime: shift.graceTime,
      });
    } else {
      setEditingShift(null);
      setFormData({
        name: '',
        startTime: new Date(),
        endTime: new Date(),
        breakTime: 60,
        graceTime: 15,
      });
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setEditingShift(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = editingShift ? `/api/shifts/${editingShift._id}` : '/api/shifts';
      const method = editingShift ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          startTime: formData.startTime.toTimeString().slice(0, 5),
          endTime: formData.endTime.toTimeString().slice(0, 5),
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save shift');
      }

      fetchShifts();
      handleClose();
    } catch (error) {
      setError('Error saving shift');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/shifts/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete shift');
      }

      fetchShifts();
    } catch (error) {
      setError('Error deleting shift');
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h5">Shift Management</Typography>
        <Button variant="contained" color="primary" onClick={() => handleOpen()}>
          Add New Shift
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
                <TableCell>Start Time</TableCell>
                <TableCell>End Time</TableCell>
                <TableCell>Break Time (min)</TableCell>
                <TableCell>Grace Time (min)</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {shifts.map((shift) => (
                <TableRow key={shift._id}>
                  <TableCell>{shift.name}</TableCell>
                  <TableCell>{shift.startTime}</TableCell>
                  <TableCell>{shift.endTime}</TableCell>
                  <TableCell>{shift.breakTime}</TableCell>
                  <TableCell>{shift.graceTime}</TableCell>
                  <TableCell>
                    <Switch
                      checked={shift.isActive}
                      disabled
                      color="primary"
                    />
                  </TableCell>
                  <TableCell>
                    <IconButton onClick={() => handleOpen(shift)}>
                      <EditIcon />
                    </IconButton>
                    <IconButton onClick={() => handleDelete(shift._id)}>
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>{editingShift ? 'Edit Shift' : 'Add New Shift'}</DialogTitle>
        <DialogContent>
          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
            <TextField
              fullWidth
              label="Shift Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              margin="normal"
              required
            />
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <TimePicker
                label="Start Time"
                value={formData.startTime}
                onChange={(newValue) => newValue && setFormData({ ...formData, startTime: newValue })}
                sx={{ width: '100%', mt: 2 }}
              />
              <TimePicker
                label="End Time"
                value={formData.endTime}
                onChange={(newValue) => newValue && setFormData({ ...formData, endTime: newValue })}
                sx={{ width: '100%', mt: 2 }}
              />
            </LocalizationProvider>
            <TextField
              fullWidth
              label="Break Time (minutes)"
              type="number"
              value={formData.breakTime}
              onChange={(e) => setFormData({ ...formData, breakTime: parseInt(e.target.value) })}
              margin="normal"
              required
            />
            <TextField
              fullWidth
              label="Grace Time (minutes)"
              type="number"
              value={formData.graceTime}
              onChange={(e) => setFormData({ ...formData, graceTime: parseInt(e.target.value) })}
              margin="normal"
              required
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained" color="primary">
            {editingShift ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ShiftManagement; 