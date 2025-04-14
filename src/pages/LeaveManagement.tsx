import React, { useState } from 'react';
import { Box, Typography, Paper, Tabs, Tab } from '@mui/material';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import { AuthState } from '../store/slices/authSlice';
import LeaveTypeManagement from '../components/leave/LeaveTypeManagement';
import LeaveApplications from '../components/leave/LeaveApplications';

const LeaveManagement: React.FC = () => {
  const [activeTab, setActiveTab] = useState(0);
  const { user } = useSelector((state: RootState) => state.auth as AuthState);
  const isAdmin = ['SUPER_ADMIN', 'ADMIN', 'HR_MANAGER'].includes(user?.role || '');

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Leave Management
      </Typography>

      {isAdmin ? (
        <>
          <Tabs value={activeTab} onChange={handleTabChange} sx={{ mb: 3 }}>
            <Tab label="Leave Types" />
            <Tab label="Leave Applications" />
            <Tab label="Leave Balance" />
          </Tabs>

          <Paper sx={{ p: 2 }}>
            {activeTab === 0 && <LeaveTypeManagement />}
            {activeTab === 1 && <LeaveApplications />}
            {activeTab === 2 && <Typography>Leave Balance (Coming Soon)</Typography>}
          </Paper>
        </>
      ) : (
        <Paper sx={{ p: 2 }}>
          <LeaveApplications />
        </Paper>
      )}
    </Box>
  );
};

export default LeaveManagement; 