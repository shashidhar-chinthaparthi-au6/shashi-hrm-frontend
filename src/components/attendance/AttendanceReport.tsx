import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import { attendanceService } from '../../services/attendanceService';
import { useAppSelector } from '../../store/hooks';

const AttendanceReport: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [report, setReport] = useState<any>(null);
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());
  const currentUser = useAppSelector((state) => state.auth.user);
  console.log('currentUser', currentUser);
  const fetchReport = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await attendanceService.getAttendanceReport({
        employeeId: currentUser?.id,
        month,
        year,
      });
      setReport(data);
    } catch (err) {
      setError('Failed to fetch attendance report');
      console.error('Error fetching attendance report:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, [month, year]);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" p={3}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box p={3}>
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Box mb={3} display="flex" gap={2}>
        <FormControl sx={{ minWidth: 120 }}>
          <InputLabel>Month</InputLabel>
          <Select
            value={month}
            label="Month"
            onChange={(e) => setMonth(Number(e.target.value))}
          >
            {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
              <MenuItem key={m} value={m}>
                {new Date(2000, m - 1).toLocaleString('default', { month: 'long' })}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <FormControl sx={{ minWidth: 120 }}>
          <InputLabel>Year</InputLabel>
          <Select
            value={year}
            label="Year"
            onChange={(e) => setYear(Number(e.target.value))}
          >
            {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i).map((y) => (
              <MenuItem key={y} value={y}>
                {y}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      {report && (
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Attendance Statistics
              </Typography>
              <TableContainer>
                <Table>
                  <TableBody>
                    <TableRow>
                      <TableCell>Total Days</TableCell>
                      <TableCell>{report.stats.totalDays}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Present</TableCell>
                      <TableCell>{report.stats.present}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Absent</TableCell>
                      <TableCell>{report.stats.absent}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Late</TableCell>
                      <TableCell>{report.stats.late}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Half Day</TableCell>
                      <TableCell>{report.stats.halfDay}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>On Leave</TableCell>
                      <TableCell>{report.stats.onLeave}</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          </Grid>
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Daily Attendance
              </Typography>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Date</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Check In</TableCell>
                      <TableCell>Check Out</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {report.attendance.map((record: any) => (
                      <TableRow key={record._id}>
                        <TableCell>
                          {new Date(record.date).toLocaleDateString()}
                        </TableCell>
                        <TableCell>{record.status}</TableCell>
                        <TableCell>
                          {record.checkIn
                            ? new Date(record.checkIn).toLocaleTimeString()
                            : '-'}
                        </TableCell>
                        <TableCell>
                          {record.checkOut
                            ? new Date(record.checkOut).toLocaleTimeString()
                            : '-'}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          </Grid>
        </Grid>
      )}
    </Box>
  );
};

export default AttendanceReport; 