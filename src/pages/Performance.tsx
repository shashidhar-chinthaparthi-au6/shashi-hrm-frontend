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
  Rating,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import EditIcon from '@mui/icons-material/Edit';
import AssessmentIcon from '@mui/icons-material/Assessment';
import { format } from 'date-fns';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../store';

interface PerformanceReview {
  _id: string;
  employeeId: string;
  employeeName: string;
  reviewPeriod: string;
  reviewer: string;
  overallRating: number;
  goals: {
    description: string;
    status: 'completed' | 'in_progress' | 'not_started';
    rating: number;
  }[];
  strengths: string[];
  areasForImprovement: string[];
  status: 'draft' | 'submitted' | 'approved' | 'completed';
}

const Performance = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: RootState) => state.auth);
  const [reviews, setReviews] = useState<PerformanceReview[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState<Date>(new Date());
  const [selectedTab, setSelectedTab] = useState(0);

  useEffect(() => {
    fetchPerformanceReviews();
  }, [selectedPeriod]);

  const fetchPerformanceReviews = async () => {
    try {
      setLoading(true);
      // TODO: Implement API call to fetch performance reviews
      setReviews([]);
    } catch (err) {
      setError('Failed to fetch performance reviews');
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setSelectedTab(newValue);
  };

  const handlePeriodChange = (date: Date | null) => {
    if (date) {
      setSelectedPeriod(date);
    }
  };

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Performance Management</Typography>
        <Box>
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <DatePicker
              views={['year', 'month']}
              label="Select Review Period"
              value={selectedPeriod}
              onChange={handlePeriodChange}
              slotProps={{
                textField: {
                  size: 'small',
                },
              }}
            />
          </LocalizationProvider>
        </Box>
      </Box>

      <Tabs value={selectedTab} onChange={handleTabChange} sx={{ mb: 3 }}>
        <Tab label="Performance Reviews" />
        <Tab label="Goals & Objectives" />
        <Tab label="Reports" />
      </Tabs>

      {error && (
        <Box mb={2}>
          <Typography color="error">{error}</Typography>
        </Box>
      )}

      {loading ? (
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
          <CircularProgress />
        </Box>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Employee</TableCell>
                <TableCell>Review Period</TableCell>
                <TableCell>Reviewer</TableCell>
                <TableCell>Overall Rating</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {reviews.map((review) => (
                <TableRow key={review._id}>
                  <TableCell>{review.employeeName}</TableCell>
                  <TableCell>{review.reviewPeriod}</TableCell>
                  <TableCell>{review.reviewer}</TableCell>
                  <TableCell>
                    <Rating value={review.overallRating} readOnly />
                  </TableCell>
                  <TableCell>{review.status}</TableCell>
                  <TableCell>
                    <IconButton size="small">
                      <EditIcon />
                    </IconButton>
                    <IconButton size="small">
                      <AssessmentIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
};

export default Performance; 