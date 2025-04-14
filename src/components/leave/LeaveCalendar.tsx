import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  IconButton,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from '@mui/material';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import format from 'date-fns/format';
import parse from 'date-fns/parse';
import startOfWeek from 'date-fns/startOfWeek';
import getDay from 'date-fns/getDay';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import TodayIcon from '@mui/icons-material/Today';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';

const locales = {
  'en-US': require('date-fns/locale/en-US'),
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

interface LeaveEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  status: 'pending' | 'approved' | 'rejected';
  leaveType: string;
}

const LeaveCalendar: React.FC = () => {
  const [events, setEvents] = useState<LeaveEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    startDate: new Date(),
    endDate: new Date(),
    leaveType: '',
    reason: '',
  });

  useEffect(() => {
    fetchLeaves();
  }, [currentDate]);

  const fetchLeaves = async () => {
    try {
      setLoading(true);
      const startDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
      const endDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);

      const response = await fetch(
        `/api/leave/applications?startDate=${format(startDate, 'yyyy-MM-dd')}&endDate=${format(
          endDate,
          'yyyy-MM-dd'
        )}`
      );
      const data = await response.json();

      const formattedEvents = data.map((leave: any) => ({
        id: leave._id,
        title: `${leave.leaveType.name} - ${leave.status}`,
        start: new Date(leave.startDate),
        end: new Date(leave.endDate),
        status: leave.status,
        leaveType: leave.leaveType.name,
      }));

      setEvents(formattedEvents);
    } catch (error) {
      setError('Error fetching leave data');
    } finally {
      setLoading(false);
    }
  };

  const eventStyleGetter = (event: LeaveEvent) => {
    const backgroundColor = {
      pending: '#ff9800',
      approved: '#4caf50',
      rejected: '#f44336',
    }[event.status];

    return {
      style: {
        backgroundColor,
        borderRadius: '4px',
        opacity: 0.8,
        color: 'white',
        border: '0px',
        display: 'block',
      },
    };
  };

  const navigate = (date: Date) => {
    setCurrentDate(date);
  };

  const handleOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setFormData({
      startDate: new Date(),
      endDate: new Date(),
      leaveType: '',
      reason: '',
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/leave/applications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          startDate: format(formData.startDate, 'yyyy-MM-dd'),
          endDate: format(formData.endDate, 'yyyy-MM-dd'),
          leaveType: formData.leaveType,
          reason: formData.reason,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to submit leave application');
      }

      fetchLeaves();
      handleClose();
    } catch (error) {
      setError('Error submitting leave application');
    }
  };

  const CustomToolbar = (toolbar: any) => {
    const goToBack = () => {
      const date = new Date(toolbar.date);
      date.setMonth(date.getMonth() - 1);
      toolbar.onNavigate('prev');
      setCurrentDate(date);
    };

    const goToNext = () => {
      const date = new Date(toolbar.date);
      date.setMonth(date.getMonth() + 1);
      toolbar.onNavigate('next');
      setCurrentDate(date);
    };

    const goToCurrent = () => {
      const now = new Date();
      toolbar.onNavigate('current');
      setCurrentDate(now);
    };

    return (
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <IconButton onClick={goToBack}>
            <ArrowBackIosIcon />
          </IconButton>
          <Typography variant="h6" sx={{ mx: 2 }}>
            {format(toolbar.date, 'MMMM yyyy')}
          </Typography>
          <IconButton onClick={goToNext}>
            <ArrowForwardIosIcon />
          </IconButton>
        </Box>
        <Box>
          <Button
            variant="contained"
            startIcon={<TodayIcon />}
            onClick={goToCurrent}
            sx={{ mr: 2 }}
          >
            Today
          </Button>
          <Button variant="contained" color="primary" onClick={handleOpen}>
            Apply for Leave
          </Button>
        </Box>
      </Box>
    );
  };

  return (
    <Box sx={{ p: 3 }}>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {loading ? (
        <CircularProgress />
      ) : (
        <Paper sx={{ p: 2 }}>
          <Calendar
            localizer={localizer}
            events={events}
            startAccessor="start"
            endAccessor="end"
            style={{ height: 600 }}
            eventPropGetter={eventStyleGetter}
            components={{
              toolbar: CustomToolbar,
            }}
            onNavigate={navigate}
          />
        </Paper>
      )}

      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>Apply for Leave</DialogTitle>
        <DialogContent>
          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DatePicker
                label="Start Date"
                value={formData.startDate}
                onChange={(newValue) => newValue && setFormData({ ...formData, startDate: newValue })}
                sx={{ width: '100%', mb: 2 }}
              />
              <DatePicker
                label="End Date"
                value={formData.endDate}
                onChange={(newValue) => newValue && setFormData({ ...formData, endDate: newValue })}
                sx={{ width: '100%', mb: 2 }}
              />
            </LocalizationProvider>
            <TextField
              fullWidth
              label="Leave Type"
              value={formData.leaveType}
              onChange={(e) => setFormData({ ...formData, leaveType: e.target.value })}
              margin="normal"
              required
            />
            <TextField
              fullWidth
              multiline
              rows={3}
              label="Reason"
              value={formData.reason}
              onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
              margin="normal"
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

export default LeaveCalendar; 