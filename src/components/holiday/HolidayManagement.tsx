import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  CircularProgress,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';

interface Holiday {
  _id: string;
  name: string;
  date: string;
  type: string;
  description: string;
}

const HolidayManagement: React.FC = () => {
  const [holidays, setHolidays] = useState<Holiday[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [editingHoliday, setEditingHoliday] = useState<Holiday | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    date: new Date(),
    type: '',
    description: '',
  });

  useEffect(() => {
    fetchHolidays();
  }, []);

  const fetchHolidays = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/holidays');
      const data = await response.json();
      setHolidays(data);
    } catch (error) {
      setError('Error fetching holidays');
    } finally {
      setLoading(false);
    }
  };

  const handleOpen = (holiday?: Holiday) => {
    if (holiday) {
      setEditingHoliday(holiday);
      setFormData({
        name: holiday.name,
        date: new Date(holiday.date),
        type: holiday.type,
        description: holiday.description,
      });
    } else {
      setEditingHoliday(null);
      setFormData({
        name: '',
        date: new Date(),
        type: '',
        description: '',
      });
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setEditingHoliday(null);
    setFormData({
      name: '',
      date: new Date(),
      type: '',
      description: '',
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = editingHoliday
        ? `/api/holidays/${editingHoliday._id}`
        : '/api/holidays';
      const method = editingHoliday ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          date: formData.date.toISOString().split('T')[0],
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save holiday');
      }

      fetchHolidays();
      handleClose();
    } catch (error) {
      setError('Error saving holiday');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/holidays/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete holiday');
      }

      fetchHolidays();
    } catch (error) {
      setError('Error deleting holiday');
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h5">Holiday Management</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpen()}
        >
          Add Holiday
        </Button>
      </Box>

      {loading ? (
        <CircularProgress />
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Date</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Description</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {holidays.map((holiday) => (
                <TableRow key={holiday._id}>
                  <TableCell>{holiday.name}</TableCell>
                  <TableCell>{holiday.date}</TableCell>
                  <TableCell>{holiday.type}</TableCell>
                  <TableCell>{holiday.description}</TableCell>
                  <TableCell>
                    <IconButton onClick={() => handleOpen(holiday)}>
                      <EditIcon />
                    </IconButton>
                    <IconButton onClick={() => handleDelete(holiday._id)}>
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
        <DialogTitle>
          {editingHoliday ? 'Edit Holiday' : 'Add New Holiday'}
        </DialogTitle>
        <DialogContent>
          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
            <TextField
              fullWidth
              label="Name"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              margin="normal"
              required
            />
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DatePicker
                label="Date"
                value={formData.date}
                onChange={(newValue) =>
                  newValue && setFormData({ ...formData, date: newValue })
                }
                sx={{ width: '100%', mt: 2 }}
              />
            </LocalizationProvider>
            <TextField
              fullWidth
              label="Type"
              value={formData.type}
              onChange={(e) =>
                setFormData({ ...formData, type: e.target.value })
              }
              margin="normal"
              required
            />
            <TextField
              fullWidth
              multiline
              rows={3}
              label="Description"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              margin="normal"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained" color="primary">
            {editingHoliday ? 'Update' : 'Add'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default HolidayManagement; 