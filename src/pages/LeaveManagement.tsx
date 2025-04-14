import React, { useState } from 'react';
import { Box, Typography, Paper, Tabs, Tab } from '@mui/material';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import { AuthState } from '../store/slices/authSlice';
import LeaveTypeManagement from '../components/leave/LeaveTypeManagement';

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
            {activeTab === 1 && <Typography>Leave Applications (Coming Soon)</Typography>}
            {activeTab === 2 && <Typography>Leave Balance (Coming Soon)</Typography>}
          </Paper>
        </>
      ) : (
        <Paper sx={{ p: 2 }}>
          <Typography variant="h6" gutterBottom>
            My Leave Applications
          </Typography>
          <Typography paragraph>
            You can apply for leave and view your leave history here.
          </Typography>
          {/* Placeholder for employee leave application form and history */}
          <Typography color="text.secondary">
            Leave application form and history will be implemented here.
          </Typography>
        </Paper>
      )}
    </Box>
  );
};

export default LeaveManagement; 