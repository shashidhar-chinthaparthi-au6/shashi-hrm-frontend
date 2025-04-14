import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  TextField,
  IconButton,
  Tooltip,
  Card,
  CardContent,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import DownloadIcon from '@mui/icons-material/Download';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { format } from 'date-fns';

interface ReportData {
  date: string;
  employeeId: string;
  employeeName: string;
  checkIn: string;
  checkOut: string;
  status: string;
  lateMinutes: number;
  earlyDepartureMinutes: number;
  totalHours: number;
}

const AttendanceReports: React.FC = () => {
  const [reportType, setReportType] = useState('daily');
  const [startDate, setStartDate] = useState<Date | null>(new Date());
  const [endDate, setEndDate] = useState<Date | null>(new Date());
  const [data, setData] = useState<ReportData[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchReportData = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `/api/attendance/reports?type=${reportType}&startDate=${startDate?.toISOString()}&endDate=${endDate?.toISOString()}`
      );
      const result = await response.json();
      setData(result);
    } catch (error) {
      console.error('Error fetching report data:', error);
    } finally {
      setLoading(false);
    }
  };

  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Attendance Report');
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const dataBlob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    saveAs(dataBlob, 'attendance_report.xlsx');
  };

  const exportToPDF = () => {
    // Implement PDF export using a PDF generation library
    console.log('PDF export to be implemented');
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Attendance Reports
      </Typography>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={3}>
            <Grid item xs={12} md={3}>
              <FormControl fullWidth>
                <InputLabel>Report Type</InputLabel>
                <Select
                  value={reportType}
                  label="Report Type"
                  onChange={(e) => setReportType(e.target.value)}
                >
                  <MenuItem value="daily">Daily Report</MenuItem>
                  <MenuItem value="monthly">Monthly Report</MenuItem>
                  <MenuItem value="late">Late Arrivals</MenuItem>
                  <MenuItem value="early">Early Departures</MenuItem>
                  <MenuItem value="absent">Absentees</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={3}>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DatePicker
                  label="Start Date"
                  value={startDate}
                  onChange={setStartDate}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                    },
                  }}
                />
              </LocalizationProvider>
            </Grid>
            <Grid item xs={12} md={3}>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DatePicker
                  label="End Date"
                  value={endDate}
                  onChange={setEndDate}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                    },
                  }}
                />
              </LocalizationProvider>
            </Grid>
            <Grid item xs={12} md={3}>
              <Button
                variant="contained"
                color="primary"
                onClick={fetchReportData}
                fullWidth
              >
                Generate Report
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      <Paper sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
          <Typography variant="h6">Report Results</Typography>
          <Box>
            <Tooltip title="Export to Excel">
              <IconButton onClick={exportToExcel} color="primary">
                <DownloadIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Export to PDF">
              <IconButton onClick={exportToPDF} color="primary">
                <PictureAsPdfIcon />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Date</TableCell>
                <TableCell>Employee ID</TableCell>
                <TableCell>Employee Name</TableCell>
                <TableCell>Check In</TableCell>
                <TableCell>Check Out</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Late Minutes</TableCell>
                <TableCell>Early Departure</TableCell>
                <TableCell>Total Hours</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {data.map((row, index) => (
                <TableRow key={index}>
                  <TableCell>{row.date}</TableCell>
                  <TableCell>{row.employeeId}</TableCell>
                  <TableCell>{row.employeeName}</TableCell>
                  <TableCell>{row.checkIn}</TableCell>
                  <TableCell>{row.checkOut}</TableCell>
                  <TableCell>{row.status}</TableCell>
                  <TableCell>{row.lateMinutes}</TableCell>
                  <TableCell>{row.earlyDepartureMinutes}</TableCell>
                  <TableCell>{row.totalHours}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Box>
  );
};

export default AttendanceReports; 