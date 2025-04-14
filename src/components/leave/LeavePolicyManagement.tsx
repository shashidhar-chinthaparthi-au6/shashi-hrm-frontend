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
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
} from '@mui/material';

interface LeaveType {
  _id: string;
  name: string;
  description: string;
}

interface LeavePolicy {
  _id: string;
  name: string;
  description: string;
  leaveTypes: LeaveType[];
  createdAt: string;
}

const LeavePolicyManagement: React.FC = () => {
  const [policies, setPolicies] = useState<LeavePolicy[]>([]);
  const [leaveTypes, setLeaveTypes] = useState<LeaveType[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedPolicy, setSelectedPolicy] = useState<LeavePolicy | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    leaveTypes: [] as string[],
  });

  useEffect(() => {
    fetchPolicies();
    fetchLeaveTypes();
  }, []);

  const fetchPolicies = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/leave/policies');
      const data = await response.json();
      setPolicies(data);
    } catch (error) {
      setError('Error fetching leave policies');
    } finally {
      setLoading(false);
    }
  };

  const fetchLeaveTypes = async () => {
    try {
      const response = await fetch('/api/leave/types');
      const data = await response.json();
      setLeaveTypes(data);
    } catch (error) {
      setError('Error fetching leave types');
    }
  };

  const handleCreate = async () => {
    try {
      const response = await fetch('/api/leave/policies', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        fetchPolicies();
        setDialogOpen(false);
        setFormData({
          name: '',
          description: '',
          leaveTypes: [],
        });
      } else {
        setError('Error creating leave policy');
      }
    } catch (error) {
      setError('Error creating leave policy');
    }
  };

  const handleUpdate = async () => {
    if (!selectedPolicy) return;

    try {
      const response = await fetch(`/api/leave/policies/${selectedPolicy._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        fetchPolicies();
        setDialogOpen(false);
        setSelectedPolicy(null);
        setFormData({
          name: '',
          description: '',
          leaveTypes: [],
        });
      } else {
        setError('Error updating leave policy');
      }
    } catch (error) {
      setError('Error updating leave policy');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/leave/policies/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        fetchPolicies();
      } else {
        setError('Error deleting leave policy');
      }
    } catch (error) {
      setError('Error deleting leave policy');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h5">Leave Policies</Typography>
        <Button
          variant="contained"
          onClick={() => {
            setSelectedPolicy(null);
            setFormData({
              name: '',
              description: '',
              leaveTypes: [],
            });
            setDialogOpen(true);
          }}
        >
          Create Policy
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {loading ? (
        <CircularProgress />
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Description</TableCell>
                <TableCell>Leave Types</TableCell>
                <TableCell>Created At</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {policies.map((policy) => (
                <TableRow key={policy._id}>
                  <TableCell>{policy.name}</TableCell>
                  <TableCell>{policy.description}</TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                      {policy.leaveTypes.map((type) => (
                        <Chip
                          key={type._id}
                          label={type.name}
                          size="small"
                          variant="outlined"
                        />
                      ))}
                    </Box>
                  </TableCell>
                  <TableCell>{formatDate(policy.createdAt)}</TableCell>
                  <TableCell>
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={() => {
                        setSelectedPolicy(policy);
                        setFormData({
                          name: policy.name,
                          description: policy.description,
                          leaveTypes: policy.leaveTypes.map((type) => type._id),
                        });
                        setDialogOpen(true);
                      }}
                      sx={{ mr: 1 }}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="outlined"
                      color="error"
                      size="small"
                      onClick={() => handleDelete(policy._id)}
                    >
                      Delete
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          {selectedPolicy ? 'Edit Leave Policy' : 'Create Leave Policy'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <TextField
              fullWidth
              label="Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              multiline
              rows={4}
              label="Description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              sx={{ mb: 2 }}
            />
            <FormControl fullWidth>
              <InputLabel>Leave Types</InputLabel>
              <Select
                multiple
                value={formData.leaveTypes}
                onChange={(e) => setFormData({ ...formData, leaveTypes: e.target.value as string[] })}
                label="Leave Types"
                renderValue={(selected) => (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {selected.map((value) => (
                      <Chip
                        key={value}
                        label={leaveTypes.find((type) => type._id === value)?.name}
                        size="small"
                      />
                    ))}
                  </Box>
                )}
              >
                {leaveTypes.map((type) => (
                  <MenuItem key={type._id} value={type._id}>
                    {type.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={selectedPolicy ? handleUpdate : handleCreate}
            variant="contained"
          >
            {selectedPolicy ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default LeavePolicyManagement; 