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
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
} from '@mui/material';

interface LeaveType {
  _id: string;
  name: string;
  description: string;
  defaultDays: number;
  isPaid: boolean;
}

interface LeavePolicy {
  _id: string;
  name: string;
  description: string;
  leaveTypes: {
    leaveType: LeaveType;
    maxDays: number;
    carryForward: boolean;
    maxCarryForward: number;
    encashmentEligible: boolean;
    encashmentRate: number;
  }[];
  createdAt: string;
  updatedAt: string;
}

const LeavePolicyConfig: React.FC = () => {
  const [policies, setPolicies] = useState<LeavePolicy[]>([]);
  const [leaveTypes, setLeaveTypes] = useState<LeaveType[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [selectedPolicy, setSelectedPolicy] = useState<LeavePolicy | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    leaveTypes: [] as {
      leaveType: string;
      maxDays: number;
      carryForward: boolean;
      maxCarryForward: number;
      encashmentEligible: boolean;
      encashmentRate: number;
    }[],
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

  const handleOpen = (policy?: LeavePolicy) => {
    if (policy) {
      setSelectedPolicy(policy);
      setFormData({
        name: policy.name,
        description: policy.description,
        leaveTypes: policy.leaveTypes.map((lt) => ({
          leaveType: lt.leaveType._id,
          maxDays: lt.maxDays,
          carryForward: lt.carryForward,
          maxCarryForward: lt.maxCarryForward,
          encashmentEligible: lt.encashmentEligible,
          encashmentRate: lt.encashmentRate,
        })),
      });
    } else {
      setSelectedPolicy(null);
      setFormData({
        name: '',
        description: '',
        leaveTypes: [],
      });
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedPolicy(null);
    setFormData({
      name: '',
      description: '',
      leaveTypes: [],
    });
  };

  const handleSubmit = async () => {
    try {
      const url = selectedPolicy
        ? `/api/leave/policies/${selectedPolicy._id}`
        : '/api/leave/policies';
      const method = selectedPolicy ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Failed to save policy');
      }

      handleClose();
      fetchPolicies();
    } catch (error) {
      setError('Error saving leave policy');
    }
  };

  const handleAddLeaveType = () => {
    setFormData({
      ...formData,
      leaveTypes: [
        ...formData.leaveTypes,
        {
          leaveType: '',
          maxDays: 0,
          carryForward: false,
          maxCarryForward: 0,
          encashmentEligible: false,
          encashmentRate: 0,
        },
      ],
    });
  };

  const handleRemoveLeaveType = (index: number) => {
    setFormData({
      ...formData,
      leaveTypes: formData.leaveTypes.filter((_, i) => i !== index),
    });
  };

  const handleLeaveTypeChange = (index: number, field: string, value: any) => {
    const updatedLeaveTypes = [...formData.leaveTypes];
    updatedLeaveTypes[index] = {
      ...updatedLeaveTypes[index],
      [field]: value,
    };
    setFormData({
      ...formData,
      leaveTypes: updatedLeaveTypes,
    });
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h5">Leave Policies</Typography>
        <Button variant="contained" color="primary" onClick={() => handleOpen()}>
          Add Policy
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
                    {policy.leaveTypes.map((lt) => lt.leaveType.name).join(', ')}
                  </TableCell>
                  <TableCell>
                    {new Date(policy.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <Button onClick={() => handleOpen(policy)}>Edit</Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
        <DialogTitle>
          {selectedPolicy ? 'Edit Leave Policy' : 'Add Leave Policy'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <TextField
              fullWidth
              label="Name"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="Description"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              multiline
              rows={3}
              sx={{ mb: 2 }}
            />
            <Typography variant="h6" sx={{ mb: 2 }}>
              Leave Types
            </Typography>
            {formData.leaveTypes.map((lt, index) => (
              <Paper key={index} sx={{ p: 2, mb: 2 }}>
                <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                  <FormControl fullWidth>
                    <InputLabel>Leave Type</InputLabel>
                    <Select
                      value={lt.leaveType}
                      onChange={(e) =>
                        handleLeaveTypeChange(index, 'leaveType', e.target.value)
                      }
                    >
                      {leaveTypes.map((type) => (
                        <MenuItem key={type._id} value={type._id}>
                          {type.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  <TextField
                    label="Max Days"
                    type="number"
                    value={lt.maxDays}
                    onChange={(e) =>
                      handleLeaveTypeChange(
                        index,
                        'maxDays',
                        parseInt(e.target.value)
                      )
                    }
                  />
                </Box>
                <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={lt.carryForward}
                        onChange={(e) =>
                          handleLeaveTypeChange(
                            index,
                            'carryForward',
                            e.target.checked
                          )
                        }
                      />
                    }
                    label="Allow Carry Forward"
                  />
                  {lt.carryForward && (
                    <TextField
                      label="Max Carry Forward Days"
                      type="number"
                      value={lt.maxCarryForward}
                      onChange={(e) =>
                        handleLeaveTypeChange(
                          index,
                          'maxCarryForward',
                          parseInt(e.target.value)
                        )
                      }
                    />
                  )}
                </Box>
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={lt.encashmentEligible}
                        onChange={(e) =>
                          handleLeaveTypeChange(
                            index,
                            'encashmentEligible',
                            e.target.checked
                          )
                        }
                      />
                    }
                    label="Allow Encashment"
                  />
                  {lt.encashmentEligible && (
                    <TextField
                      label="Encashment Rate"
                      type="number"
                      value={lt.encashmentRate}
                      onChange={(e) =>
                        handleLeaveTypeChange(
                          index,
                          'encashmentRate',
                          parseFloat(e.target.value)
                        )
                      }
                    />
                  )}
                </Box>
                <Button
                  color="error"
                  onClick={() => handleRemoveLeaveType(index)}
                  sx={{ mt: 1 }}
                >
                  Remove
                </Button>
              </Paper>
            ))}
            <Button
              variant="outlined"
              onClick={handleAddLeaveType}
              sx={{ mt: 2 }}
            >
              Add Leave Type
            </Button>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained" color="primary">
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default LeavePolicyConfig; 