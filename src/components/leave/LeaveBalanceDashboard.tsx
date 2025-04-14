import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  CircularProgress,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  LinearProgress,
} from '@mui/material';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import axios from 'axios';
import { format } from 'date-fns';

interface LeaveBalance {
  leaveType: string;
  totalDays: number;
  usedDays: number;
  remainingDays: number;
}

interface LeaveHistory {
  date: string;
  leaveType: string;
  days: number;
  status: string;
}

const LeaveBalanceDashboard: React.FC = () => {
  const [balances, setBalances] = useState<LeaveBalance[]>([]);
  const [history, setHistory] = useState<LeaveHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [balanceResponse, historyResponse] = await Promise.all([
          axios.get('/api/leave/balances'),
          axios.get('/api/leave/history'),
        ]);

        setBalances(balanceResponse.data);
        setHistory(historyResponse.data);
      } catch (err) {
        setError('Failed to fetch leave data');
        console.error('Error fetching leave data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const getProgressColor = (used: number, total: number) => {
    const percentage = (used / total) * 100;
    if (percentage > 80) return '#f44336';
    if (percentage > 50) return '#ff9800';
    return '#4caf50';
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
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Leave Balance Dashboard
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Leave Balance
              </Typography>
              {balances.map((item) => (
                <Box key={item.leaveType} mb={2}>
                  <Typography variant="subtitle1">{item.leaveType}</Typography>
                  <Typography>
                    Total: {item.totalDays} days | Used: {item.usedDays} days | Remaining: {item.remainingDays} days
                  </Typography>
                </Box>
              ))}
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Leave Usage History
              </Typography>
              <Box sx={{ height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={history}
                    margin={{
                      top: 5,
                      right: 30,
                      left: 20,
                      bottom: 5,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="days" fill="#8884d8" name="Days" />
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default LeaveBalanceDashboard; 