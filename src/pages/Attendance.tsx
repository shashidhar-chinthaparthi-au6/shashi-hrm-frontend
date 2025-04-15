import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Card,
  CardContent,
  Tabs,
  Tab,
  CircularProgress,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import EditIcon from '@mui/icons-material/Edit';
import DownloadIcon from '@mui/icons-material/Download';
import SettingsIcon from '@mui/icons-material/Settings';
import { format } from 'date-fns';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../store';
import {
  fetchDailyAttendance,
  updateAttendanceRecord,
  fetchAttendanceSettings,
  updateAttendanceSettings,
  markAttendance,
} from '../store/attendanceSlice';
import { attendanceService } from '../services/attendance.service';

const Attendance = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { records, settings, loading, error } = useSelector((state: RootState) => state.attendance);
  const { user } = useSelector((state: RootState) => state.auth);
  
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [settingsDialogOpen, setSettingsDialogOpen] = useState(false);
  const [markAttendanceDialogOpen, setMarkAttendanceDialogOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<any>(null);
  const [currentTab, setCurrentTab] = useState(0);
  const [reportStartDate, setReportStartDate] = useState<Date | null>(new Date());
  const [reportEndDate, setReportEndDate] = useState<Date | null>(new Date());
  const [localSettings, setLocalSettings] = useState(settings);
  const [attendanceData, setAttendanceData] = useState({
    date: format(new Date(), 'yyyy-MM-dd'),
    checkIn: format(new Date(), 'HH:mm'),
    checkOut: '',
    status: 'present',
    notes: '',
  });

  useEffect(() => {
    if (selectedDate) {
      dispatch(fetchDailyAttendance(format(selectedDate, 'yyyy-MM-dd')));
    }
  }, [dispatch, selectedDate]);

  useEffect(() => {
    dispatch(fetchAttendanceSettings());
  }, [dispatch]);

  useEffect(() => {
    if (settings) {
      setLocalSettings(settings);
    }
  }, [settings]);

  const handleEditRecord = (record: any) => {
    setSelectedRecord(record);
    setEditDialogOpen(true);
  };

  const handleSaveRecord = async () => {
    if (selectedRecord) {
      await dispatch(updateAttendanceRecord({
        id: selectedRecord._id,
        data: {
          checkIn: selectedRecord.checkIn,
          checkOut: selectedRecord.checkOut,
          status: selectedRecord.status,
          notes: selectedRecord.notes,
        }
      }));
      setEditDialogOpen(false);
    }
  };

  const handleSaveSettings = async () => {
    if (localSettings) {
      await dispatch(updateAttendanceSettings(localSettings));
      setSettingsDialogOpen(false);
    }
  };

  const handleGenerateReport = async () => {
    if (reportStartDate && reportEndDate) {
      try {
        const blob = await attendanceService.downloadReport(
          format(reportStartDate, 'yyyy-MM-dd'),
          format(reportEndDate, 'yyyy-MM-dd')
        );
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `attendance-report-${format(reportStartDate, 'yyyy-MM-dd')}-to-${format(reportEndDate, 'yyyy-MM-dd')}.xlsx`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
      } catch (error) {
        console.error('Failed to download report:', error);
      }
    }
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setCurrentTab(newValue);
  };

  const handleMarkAttendance = async () => {
    if (!user?.id) {
      console.error('User ID is required');
      return;
    }

    try {
      await dispatch(markAttendance({
        ...attendanceData,
        employeeId: user.id,
      }));
      setMarkAttendanceDialogOpen(false);
      // Refresh the attendance records
      if (selectedDate) {
        dispatch(fetchDailyAttendance(format(selectedDate, 'yyyy-MM-dd')));
      }
    } catch (error) {
      console.error('Error marking attendance:', error);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box p={2}>
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Attendance Management</Typography>
        <Box>
          <Button
            variant="contained"
            color="primary"
            onClick={() => setMarkAttendanceDialogOpen(true)}
            sx={{ mr: 2 }}
          >
            Mark Attendance
          </Button>
          <IconButton onClick={() => setSettingsDialogOpen(true)} title="Attendance Settings">
            <SettingsIcon />
          </IconButton>
        </Box>
      </Box>

      <Tabs value={currentTab} onChange={handleTabChange} sx={{ mb: 3 }}>
        <Tab label="Daily Attendance" />
        <Tab label="Reports" />
      </Tabs>

      {/* Mark Attendance Dialog */}
      <Dialog open={markAttendanceDialogOpen} onClose={() => setMarkAttendanceDialogOpen(false)}>
        <DialogTitle>Mark Attendance</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2, display: 'grid', gap: 2 }}>
            <TextField
              type="date"
              label="Date"
              value={attendanceData.date}
              onChange={(e) => setAttendanceData({ ...attendanceData, date: e.target.value })}
              InputLabelProps={{ shrink: true }}
              fullWidth
            />
            <TextField
              type="time"
              label="Check In"
              value={attendanceData.checkIn}
              onChange={(e) => setAttendanceData({ ...attendanceData, checkIn: e.target.value })}
              InputLabelProps={{ shrink: true }}
              fullWidth
            />
            <TextField
              type="time"
              label="Check Out"
              value={attendanceData.checkOut}
              onChange={(e) => setAttendanceData({ ...attendanceData, checkOut: e.target.value })}
              InputLabelProps={{ shrink: true }}
              fullWidth
            />
            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select
                value={attendanceData.status}
                label="Status"
                onChange={(e) => setAttendanceData({ ...attendanceData, status: e.target.value })}
              >
                <MenuItem value="present">Present</MenuItem>
                <MenuItem value="late">Late</MenuItem>
                <MenuItem value="half_day">Half Day</MenuItem>
                <MenuItem value="on_leave">On Leave</MenuItem>
              </Select>
            </FormControl>
            <TextField
              label="Notes"
              multiline
              rows={3}
              value={attendanceData.notes}
              onChange={(e) => setAttendanceData({ ...attendanceData, notes: e.target.value })}
              fullWidth
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setMarkAttendanceDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleMarkAttendance} variant="contained" color="primary">
            Submit
          </Button>
        </DialogActions>
      </Dialog>

      {currentTab === 0 ? (
        <Box>
          <Box mb={3}>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DatePicker
                label="Select Date"
                value={selectedDate}
                onChange={(newValue) => setSelectedDate(newValue)}
              />
            </LocalizationProvider>
          </Box>

          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Employee</TableCell>
                  <TableCell>Date</TableCell>
                  <TableCell>Check In</TableCell>
                  <TableCell>Check Out</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {records.map((record) => (
                  <TableRow key={record._id}>
                    <TableCell>{record.employeeName}</TableCell>
                    <TableCell>{format(new Date(record.date), 'MM/dd/yyyy')}</TableCell>
                    <TableCell>{record.checkIn}</TableCell>
                    <TableCell>{record.checkOut}</TableCell>
                    <TableCell>{record.status}</TableCell>
                    <TableCell>
                      <IconButton onClick={() => handleEditRecord(record)}>
                        <EditIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      ) : (
        <Box>
          <Grid container spacing={3} mb={3}>
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>Generate Attendance Report</Typography>
                  <Box display="flex" gap={2} alignItems="center">
                    <LocalizationProvider dateAdapter={AdapterDateFns}>
                      <DatePicker
                        label="Start Date"
                        value={reportStartDate}
                        onChange={(newValue) => setReportStartDate(newValue)}
                      />
                      <DatePicker
                        label="End Date"
                        value={reportEndDate}
                        onChange={(newValue) => setReportEndDate(newValue)}
                      />
                    </LocalizationProvider>
                    <Button
                      variant="contained"
                      startIcon={<DownloadIcon />}
                      onClick={handleGenerateReport}
                    >
                      Generate
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Box>
      )}

      {/* Edit Record Dialog */}
      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)}>
        <DialogTitle>Edit Attendance Record</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            {selectedRecord && (
              <>
                <TextField
                  fullWidth
                  label="Check In Time"
                  type="time"
                  value={selectedRecord.checkIn}
                  onChange={(e) => setSelectedRecord({ ...selectedRecord, checkIn: e.target.value })}
                  sx={{ mb: 2 }}
                  InputLabelProps={{ shrink: true }}
                />
                <TextField
                  fullWidth
                  label="Check Out Time"
                  type="time"
                  value={selectedRecord.checkOut}
                  onChange={(e) => setSelectedRecord({ ...selectedRecord, checkOut: e.target.value })}
                  sx={{ mb: 2 }}
                  InputLabelProps={{ shrink: true }}
                />
                <FormControl fullWidth sx={{ mb: 2 }}>
                  <InputLabel>Status</InputLabel>
                  <Select
                    value={selectedRecord.status}
                    onChange={(e) => setSelectedRecord({ ...selectedRecord, status: e.target.value })}
                    label="Status"
                  >
                    <MenuItem value="present">Present</MenuItem>
                    <MenuItem value="absent">Absent</MenuItem>
                    <MenuItem value="late">Late</MenuItem>
                    <MenuItem value="half-day">Half Day</MenuItem>
                  </Select>
                </FormControl>
                <TextField
                  fullWidth
                  label="Notes"
                  multiline
                  rows={3}
                  value={selectedRecord.notes || ''}
                  onChange={(e) => setSelectedRecord({ ...selectedRecord, notes: e.target.value })}
                />
              </>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleSaveRecord} variant="contained" color="primary">
            Save
          </Button>
        </DialogActions>
      </Dialog>

      {/* Settings Dialog */}
      <Dialog open={settingsDialogOpen} onClose={() => setSettingsDialogOpen(false)}>
        <DialogTitle>Attendance Settings</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            {localSettings && (
              <>
                <Typography variant="subtitle1" gutterBottom>Work Hours</Typography>
                <Grid container spacing={2} sx={{ mb: 2 }}>
                  <Grid item xs={6}>
                    <TextField
                      fullWidth
                      label="Start Time"
                      type="time"
                      value={localSettings.workHours.start}
                      onChange={(e) => setLocalSettings({
                        ...localSettings,
                        workHours: { ...localSettings.workHours, start: e.target.value }
                      })}
                      InputLabelProps={{ shrink: true }}
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <TextField
                      fullWidth
                      label="End Time"
                      type="time"
                      value={localSettings.workHours.end}
                      onChange={(e) => setLocalSettings({
                        ...localSettings,
                        workHours: { ...localSettings.workHours, end: e.target.value }
                      })}
                      InputLabelProps={{ shrink: true }}
                    />
                  </Grid>
                </Grid>
                <TextField
                  fullWidth
                  label="Late Threshold (minutes)"
                  type="number"
                  value={localSettings.lateThreshold}
                  onChange={(e) => setLocalSettings({
                    ...localSettings,
                    lateThreshold: parseInt(e.target.value)
                  })}
                  sx={{ mb: 2 }}
                />
                <TextField
                  fullWidth
                  label="Half Day Threshold (minutes)"
                  type="number"
                  value={localSettings.halfDayThreshold}
                  onChange={(e) => setLocalSettings({
                    ...localSettings,
                    halfDayThreshold: parseInt(e.target.value)
                  })}
                />
              </>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSettingsDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleSaveSettings} variant="contained" color="primary">
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Attendance; 