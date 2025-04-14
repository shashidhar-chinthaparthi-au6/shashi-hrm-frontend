import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  IconButton,
  Alert,
  CircularProgress,
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

interface AttendanceEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  status: 'present' | 'absent' | 'late' | 'half_day' | 'on_leave';
}

const AttendanceCalendar: React.FC = () => {
  const [events, setEvents] = useState<AttendanceEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentDate, setCurrentDate] = useState(new Date());

  useEffect(() => {
    fetchAttendance();
  }, [currentDate]);

  const fetchAttendance = async () => {
    try {
      setLoading(true);
      const startDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
      const endDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);

      const response = await fetch(
        `/api/attendance?startDate=${format(startDate, 'yyyy-MM-dd')}&endDate=${format(
          endDate,
          'yyyy-MM-dd'
        )}`
      );
      const data = await response.json();

      const formattedEvents = data.map((attendance: any) => ({
        id: attendance._id,
        title: attendance.status,
        start: new Date(attendance.date),
        end: new Date(attendance.date),
        status: attendance.status,
      }));

      setEvents(formattedEvents);
    } catch (error) {
      setError('Error fetching attendance data');
    } finally {
      setLoading(false);
    }
  };

  const eventStyleGetter = (event: AttendanceEvent) => {
    const backgroundColor = {
      present: '#4caf50',
      absent: '#f44336',
      late: '#ff9800',
      half_day: '#2196f3',
      on_leave: '#9c27b0',
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
        <Button
          variant="contained"
          startIcon={<TodayIcon />}
          onClick={goToCurrent}
          sx={{ ml: 2 }}
        >
          Today
        </Button>
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
    </Box>
  );
};

export default AttendanceCalendar; 