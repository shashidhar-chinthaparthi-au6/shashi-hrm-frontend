import { Box, Typography } from '@mui/material';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import DashboardCard from '../components/common/DashboardCard';

const Dashboard = () => {
  const { user } = useSelector((state: RootState) => state.auth);

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Welcome, {user?.firstName}!
      </Typography>
      <Typography variant="subtitle1" color="text.secondary" gutterBottom>
        {user?.role === 'admin'
          ? 'You have full access to manage the HR system.'
          : user?.role === 'manager'
          ? 'You can manage your team and view reports.'
          : 'You can view your information and submit requests.'}
      </Typography>

      <Box
        sx={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 3,
          mt: 2,
          '& > *': {
            flex: { xs: '100%', md: '1 1 calc(50% - 24px)' },
            minWidth: { xs: '100%', md: 'calc(50% - 24px)' },
          },
        }}
      >
        <DashboardCard
          title="Quick Actions"
          content={
            user?.role === 'admin'
              ? 'Manage employees, view reports, and configure system settings.'
              : user?.role === 'manager'
              ? 'View team attendance, approve leave requests, and manage performance.'
              : 'View your attendance, submit leave requests, and check your performance.'
          }
        />

        <DashboardCard
          title="Recent Updates"
          content={
            user?.role === 'admin'
              ? 'System updates and maintenance notifications.'
              : user?.role === 'manager'
              ? 'Team updates and pending approvals.'
              : 'Your recent activities and pending requests.'
          }
        />
      </Box>
    </Box>
  );
};

export default Dashboard; 