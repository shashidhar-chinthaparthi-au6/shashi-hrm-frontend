import React from 'react';
import { Box, Typography, Paper, Grid } from '@mui/material';
import AttendanceForm from '../components/attendance/AttendanceForm';
import AttendanceList from '../components/attendance/AttendanceList';

const Attendance: React.FC = () => {
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Attendance Management
      </Typography>
      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2 }}>
            <AttendanceForm />
          </Paper>
        </Grid>
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 2 }}>
            <AttendanceList />
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Attendance; 