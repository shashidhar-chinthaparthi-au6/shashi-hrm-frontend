import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Tabs,
  Tab,
  Grid,
  Card,
  CardContent,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
  Divider,
  Alert,
  CircularProgress,
} from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../store';
import { showToast } from '../store/toastSlice';

interface SystemSettings {
  companyName: string;
  timezone: string;
  dateFormat: string;
  currency: string;
  attendanceSettings: {
    checkInStart: string;
    checkInEnd: string;
    checkOutStart: string;
    checkOutEnd: string;
    lateThreshold: number;
    earlyDepartureThreshold: number;
  };
  leaveSettings: {
    leaveAccrual: boolean;
    carryForward: boolean;
    maxCarryForwardDays: number;
  };
  notificationSettings: {
    emailNotifications: boolean;
    pushNotifications: boolean;
    notificationTypes: string[];
  };
}

const Settings = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: RootState) => state.auth);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedTab, setSelectedTab] = useState(0);
  const [settings, setSettings] = useState<SystemSettings>({
    companyName: '',
    timezone: 'UTC',
    dateFormat: 'MM/DD/YYYY',
    currency: 'USD',
    attendanceSettings: {
      checkInStart: '09:00',
      checkInEnd: '10:00',
      checkOutStart: '17:00',
      checkOutEnd: '18:00',
      lateThreshold: 15,
      earlyDepartureThreshold: 15,
    },
    leaveSettings: {
      leaveAccrual: true,
      carryForward: true,
      maxCarryForwardDays: 5,
    },
    notificationSettings: {
      emailNotifications: true,
      pushNotifications: true,
      notificationTypes: ['attendance', 'leave', 'payroll'],
    },
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      // TODO: Implement API call to fetch settings
    } catch (err) {
      setError('Failed to fetch settings');
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setSelectedTab(newValue);
  };

  const handleSettingChange = <K extends keyof SystemSettings>(
    section: K,
    field: K extends 'companyName' | 'timezone' | 'dateFormat' | 'currency' ? K : keyof SystemSettings[K],
    value: K extends 'companyName' | 'timezone' | 'dateFormat' | 'currency' ? string : SystemSettings[K][keyof SystemSettings[K]]
  ) => {
    setSettings((prev) => ({
      ...prev,
      [section]: field === section
        ? value
        : {
            ...(prev[section] as object),
            [field]: value,
          },
    }));
  };

  const handleSaveSettings = async () => {
    try {
      setLoading(true);
      // TODO: Implement API call to save settings
      dispatch(showToast({ message: 'Settings saved successfully', severity: 'success' }));
    } catch (err) {
      setError('Failed to save settings');
      dispatch(showToast({ message: 'Failed to save settings', severity: 'error' }));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">System Settings</Typography>
        <Button
          variant="contained"
          color="primary"
          onClick={handleSaveSettings}
          disabled={loading}
        >
          {loading ? <CircularProgress size={24} /> : 'Save Settings'}
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Tabs value={selectedTab} onChange={handleTabChange} sx={{ mb: 3 }}>
        <Tab label="General" />
        <Tab label="Attendance" />
        <Tab label="Leave" />
        <Tab label="Notifications" />
      </Tabs>

      <Paper sx={{ p: 3 }}>
        {selectedTab === 0 && (
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Company Name"
                value={settings.companyName}
                onChange={(e) => handleSettingChange('companyName', 'companyName', e.target.value)}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Timezone</InputLabel>
                <Select
                  value={settings.timezone}
                  label="Timezone"
                  onChange={(e) => handleSettingChange('timezone', 'timezone', e.target.value as string)}
                >
                  <MenuItem value="UTC">UTC</MenuItem>
                  <MenuItem value="EST">Eastern Time</MenuItem>
                  <MenuItem value="PST">Pacific Time</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Date Format</InputLabel>
                <Select
                  value={settings.dateFormat}
                  label="Date Format"
                  onChange={(e) => handleSettingChange('dateFormat', 'dateFormat', e.target.value as string)}
                >
                  <MenuItem value="MM/DD/YYYY">MM/DD/YYYY</MenuItem>
                  <MenuItem value="DD/MM/YYYY">DD/MM/YYYY</MenuItem>
                  <MenuItem value="YYYY-MM-DD">YYYY-MM-DD</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Currency</InputLabel>
                <Select
                  value={settings.currency}
                  label="Currency"
                  onChange={(e) => handleSettingChange('currency', 'currency', e.target.value as string)}
                >
                  <MenuItem value="USD">USD ($)</MenuItem>
                  <MenuItem value="EUR">EUR (€)</MenuItem>
                  <MenuItem value="GBP">GBP (£)</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        )}

        {selectedTab === 1 && (
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Check-in Start Time"
                type="time"
                value={settings.attendanceSettings.checkInStart}
                onChange={(e) => handleSettingChange('attendanceSettings', 'checkInStart', e.target.value)}
                InputLabelProps={{
                  shrink: true,
                }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Check-in End Time"
                type="time"
                value={settings.attendanceSettings.checkInEnd}
                onChange={(e) => handleSettingChange('attendanceSettings', 'checkInEnd', e.target.value)}
                InputLabelProps={{
                  shrink: true,
                }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Check-out Start Time"
                type="time"
                value={settings.attendanceSettings.checkOutStart}
                onChange={(e) => handleSettingChange('attendanceSettings', 'checkOutStart', e.target.value)}
                InputLabelProps={{
                  shrink: true,
                }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Check-out End Time"
                type="time"
                value={settings.attendanceSettings.checkOutEnd}
                onChange={(e) => handleSettingChange('attendanceSettings', 'checkOutEnd', e.target.value)}
                InputLabelProps={{
                  shrink: true,
                }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Late Threshold (minutes)"
                type="number"
                value={settings.attendanceSettings.lateThreshold}
                onChange={(e) => handleSettingChange('attendanceSettings', 'lateThreshold', parseInt(e.target.value))}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Early Departure Threshold (minutes)"
                type="number"
                value={settings.attendanceSettings.earlyDepartureThreshold}
                onChange={(e) => handleSettingChange('attendanceSettings', 'earlyDepartureThreshold', parseInt(e.target.value))}
              />
            </Grid>
          </Grid>
        )}

        {selectedTab === 2 && (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.leaveSettings.leaveAccrual}
                    onChange={(e) => handleSettingChange('leaveSettings', 'leaveAccrual', e.target.checked)}
                  />
                }
                label="Enable Leave Accrual"
              />
            </Grid>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.leaveSettings.carryForward}
                    onChange={(e) => handleSettingChange('leaveSettings', 'carryForward', e.target.checked)}
                  />
                }
                label="Allow Leave Carry Forward"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Maximum Carry Forward Days"
                type="number"
                value={settings.leaveSettings.maxCarryForwardDays}
                onChange={(e) => handleSettingChange('leaveSettings', 'maxCarryForwardDays', parseInt(e.target.value))}
                disabled={!settings.leaveSettings.carryForward}
              />
            </Grid>
          </Grid>
        )}

        {selectedTab === 3 && (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.notificationSettings.emailNotifications}
                    onChange={(e) => handleSettingChange('notificationSettings', 'emailNotifications', e.target.checked)}
                  />
                }
                label="Enable Email Notifications"
              />
            </Grid>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.notificationSettings.pushNotifications}
                    onChange={(e) => handleSettingChange('notificationSettings', 'pushNotifications', e.target.checked)}
                  />
                }
                label="Enable Push Notifications"
              />
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Notification Types</InputLabel>
                <Select
                  multiple
                  value={settings.notificationSettings.notificationTypes}
                  label="Notification Types"
                  onChange={(e) => handleSettingChange('notificationSettings', 'notificationTypes', e.target.value as string[])}
                >
                  <MenuItem value="attendance">Attendance</MenuItem>
                  <MenuItem value="leave">Leave</MenuItem>
                  <MenuItem value="payroll">Payroll</MenuItem>
                  <MenuItem value="performance">Performance</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        )}
      </Paper>
    </Box>
  );
};

export default Settings; 