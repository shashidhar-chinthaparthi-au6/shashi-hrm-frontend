import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Alert,
  CircularProgress,
  Card,
  CardContent,
  Grid,
} from '@mui/material';

interface LeaveBalance {
  _id: string;
  leaveType: {
    _id: string;
    name: string;
    description: string;
    defaultDays: number;
    isPaid: boolean;
  };
  totalDays: number;
  usedDays: number;
  remainingDays: number;
  year: number;
}

const LeaveBalance: React.FC = () => {
  const [balances, setBalances] = useState<LeaveBalance[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchBalances();
  }, []);

  const fetchBalances = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/leave/balances');
      const data = await response.json();
      setBalances(data);
    } catch (error) {
      setError('Error fetching leave balances');
    } finally {
      setLoading(false);
    }
  };

  const getProgressColor = (used: number, total: number) => {
    const percentage = (used / total) * 100;
    if (percentage >= 90) return 'error';
    if (percentage >= 70) return 'warning';
    return 'success';
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" sx={{ mb: 3 }}>
        Leave Balance
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {loading ? (
        <CircularProgress />
      ) : (
        <>
          <Grid container spacing={3} sx={{ mb: 3 }}>
            {balances.map((balance) => (
              <Grid item xs={12} sm={6} md={4} key={balance._id}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      {balance.leaveType.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      {balance.leaveType.description}
                    </Typography>
                    <Box sx={{ mt: 2 }}>
                      <Typography variant="body2">
                        Total Days: {balance.totalDays}
                      </Typography>
                      <Typography variant="body2">
                        Used Days: {balance.usedDays}
                      </Typography>
                      <Typography
                        variant="body2"
                        color={getProgressColor(balance.usedDays, balance.totalDays)}
                      >
                        Remaining Days: {balance.remainingDays}
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>

          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Leave Type</TableCell>
                  <TableCell>Total Days</TableCell>
                  <TableCell>Used Days</TableCell>
                  <TableCell>Remaining Days</TableCell>
                  <TableCell>Year</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {balances.map((balance) => (
                  <TableRow key={balance._id}>
                    <TableCell>{balance.leaveType.name}</TableCell>
                    <TableCell>{balance.totalDays}</TableCell>
                    <TableCell>{balance.usedDays}</TableCell>
                    <TableCell
                      sx={{
                        color: getProgressColor(balance.usedDays, balance.totalDays),
                      }}
                    >
                      {balance.remainingDays}
                    </TableCell>
                    <TableCell>{balance.year}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </>
      )}
    </Box>
  );
};

export default LeaveBalance; 