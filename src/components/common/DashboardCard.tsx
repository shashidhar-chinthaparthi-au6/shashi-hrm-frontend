import { Paper, Typography } from '@mui/material';

interface DashboardCardProps {
  title: string;
  content: string;
}

const DashboardCard = ({ title, content }: DashboardCardProps) => {
  return (
    <Paper
      elevation={2}
      sx={{
        p: 3,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        '&:hover': {
          boxShadow: 4,
        },
      }}
    >
      <Typography variant="h6" gutterBottom>
        {title}
      </Typography>
      <Typography variant="body1" color="text.secondary">
        {content}
      </Typography>
    </Paper>
  );
};

export default DashboardCard; 