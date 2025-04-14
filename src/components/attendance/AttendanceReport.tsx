import React, { useState } from 'react';
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
  Alert,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { format, subDays } from 'date-fns';
import { saveAs } from 'file-saver';
import * as XLSX from 'xlsx';

interface AttendanceReport {
  employee: {
    _id: string;
    firstName: string;
    lastName: string;
    department: string;
  };
  totalDays: number;
  presentDays: number;
  absentDays: number;
  lateDays: number;
  halfDays: number;
  averageHours: number;
}

const AttendanceReport: React.FC = () => {
  const [startDate, setStartDate] = useState<Date>(subDays(new Date(), 30));
  const [endDate, setEndDate] = useState<Date>(new Date());
  const [department, setDepartment] = useState<string>('all');
  const [report, setReport] = useState<AttendanceReport[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [departments, setDepartments] = useState<{ _id: string; name: string }[]>([]);

  const fetchReport = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `/api/attendance/report?startDate=${format(startDate, 'yyyy-MM-dd')}&endDate=${format(
          endDate,
          'yyyy-MM-dd'
        )}&department=${department}`
      );
      const data = await response.json();
      setReport(data);
    } catch (error) {
      setError('Error fetching attendance report');
    } finally {
      setLoading(false);
    }
  };

  const fetchDepartments = async () => {
    try {
      const response = await fetch('/api/departments');
      const data = await response.json();
      setDepartments(data);
    } catch (error) {
      console.error('Error fetching departments:', error);
    }
  };

  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(
      report.map((r) => ({
        'Employee Name': `${r.employee.firstName} ${r.employee.lastName}`,
        Department: r.employee.department,
        'Total Days': r.totalDays,
        'Present Days': r.presentDays,
        'Absent Days': r.absentDays,
        'Late Days': r.lateDays,
        'Half Days': r.halfDays,
        'Average Hours': r.averageHours.toFixed(2),
      }))
    );
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Attendance Report');
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const data = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    saveAs(data, `attendance-report-${format(new Date(), 'yyyy-MM-dd')}.xlsx`);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h5">Attendance Report</Typography>
        <Button variant="contained" color="primary" onClick={exportToExcel} disabled={loading || report.length === 0}>
          Export to Excel
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={4}>
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <DatePicker
              label="Start Date"
              value={startDate}
              onChange={(date) => date && setStartDate(date)}
              sx={{ width: '100%' }}
            />
          </LocalizationProvider>
        </Grid>
        <Grid item xs={12} sm={4}>
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <DatePicker
              label="End Date"
              value={endDate}
              onChange={(date) => date && setEndDate(date)}
              sx={{ width: '100%' }}
            />
          </LocalizationProvider>
        </Grid>
        <Grid item xs={12} sm={4}>
          <FormControl fullWidth>
            <InputLabel>Department</InputLabel>
            <Select
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              label="Department"
            >
              <MenuItem value="all">All Departments</MenuItem>
              {departments.map((dept) => (
                <MenuItem key={dept._id} value={dept._id}>
                  {dept.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
      </Grid>

      <Button
        variant="contained"
        color="primary"
        onClick={fetchReport}
        disabled={loading}
        sx={{ mb: 3 }}
      >
        {loading ? <CircularProgress size={24} /> : 'Generate Report'}
      </Button>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Employee</TableCell>
              <TableCell>Department</TableCell>
              <TableCell align="right">Total Days</TableCell>
              <TableCell align="right">Present</TableCell>
              <TableCell align="right">Absent</TableCell>
              <TableCell align="right">Late</TableCell>
              <TableCell align="right">Half Day</TableCell>
              <TableCell align="right">Avg. Hours</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {report.map((record) => (
              <TableRow key={record.employee._id}>
                <TableCell>
                  {record.employee.firstName} {record.employee.lastName}
                </TableCell>
                <TableCell>{record.employee.department}</TableCell>
                <TableCell align="right">{record.totalDays}</TableCell>
                <TableCell align="right">{record.presentDays}</TableCell>
                <TableCell align="right">{record.absentDays}</TableCell>
                <TableCell align="right">{record.lateDays}</TableCell>
                <TableCell align="right">{record.halfDays}</TableCell>
                <TableCell align="right">{record.averageHours.toFixed(2)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default AttendanceReport; 