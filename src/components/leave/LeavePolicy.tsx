import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Alert,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
} from '@mui/material';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import { AuthState } from '../../store/slices/authSlice';

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
    maxCarryForwardDays: number;
    encashment: boolean;
    maxEncashmentDays: number;
    encashmentRate: number;
  }[];
  approvalHierarchy: {
    level: number;
    role: string;
  }[];
  notificationSettings: {
    notifyOnApply: boolean;
    notifyOnApprove: boolean;
    notifyOnReject: boolean;
    notifyOnCancel: boolean;
  };
}

const LeavePolicy: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [policies, setPolicies] = useState<LeavePolicy[]>([]);
  const [leaveTypes, setLeaveTypes] = useState<LeaveType[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    leaveTypes: [] as {
      leaveType: string;
      maxDays: number;
      carryForward: boolean;
      maxCarryForwardDays: number;
      encashment: boolean;
      maxEncashmentDays: number;
      encashmentRate: number;
    }[],
    approvalHierarchy: [] as { level: number; role: string }[],
    notificationSettings: {
      notifyOnApply: true,
      notifyOnApprove: true,
      notifyOnReject: true,
      notifyOnCancel: true,
    },
  });

  const { user } = useSelector((state: RootState) => state.auth as AuthState);
  const isAdmin = ['SUPER_ADMIN', 'ADMIN', 'HR_MANAGER'].includes(user?.role || '');

  useEffect(() => {
    fetchPolicies();
    fetchLeaveTypes();
  }, []);

  const fetchPolicies = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/leave-policies');
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
      const response = await fetch('/api/leave-types');
      const data = await response.json();
      setLeaveTypes(data);
    } catch (error) {
      setError('Error fetching leave types');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      const response = await fetch('/api/leave-policies', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Failed to create policy');
      }

      setOpen(false);
      setFormData({
        name: '',
        description: '',
        leaveTypes: [],
        approvalHierarchy: [],
        notificationSettings: {
          notifyOnApply: true,
          notifyOnApprove: true,
          notifyOnReject: true,
          notifyOnCancel: true,
        },
      });
      fetchPolicies();
    } catch (error) {
      setError('Error creating leave policy');
    } finally {
      setLoading(false);
    }
  };

  const addLeaveType = () => {
    setFormData({
      ...formData,
      leaveTypes: [
        ...formData.leaveTypes,
        {
          leaveType: '',
          maxDays: 0,
          carryForward: false,
          maxCarryForwardDays: 0,
          encashment: false,
          maxEncashmentDays: 0,
          encashmentRate: 0,
        },
      ],
    });
  };

  const addApprovalLevel = () => {
    setFormData({
      ...formData,
      approvalHierarchy: [
        ...formData.approvalHierarchy,
        {
          level: formData.approvalHierarchy.length + 1,
          role: '',
        },
      ],
    });
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h5">Leave Policies</Typography>
        {isAdmin && (
          <Button variant="contained" color="primary" onClick={() => setOpen(true)}>
            Create Policy
          </Button>
        )}
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Create Leave Policy</DialogTitle>
        <DialogContent>
          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
            <TextField
              label="Policy Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              fullWidth
              required
              sx={{ mb: 2 }}
            />
            <TextField
              label="Description"
              multiline
              rows={4}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              fullWidth
              required
              sx={{ mb: 2 }}
            />

            <Typography variant="h6" sx={{ mb: 2 }}>
              Leave Types
            </Typography>
            {formData.leaveTypes.map((lt, index) => (
              <Box key={index} sx={{ mb: 2, p: 2, border: '1px solid #ddd', borderRadius: 1 }}>
                <FormControl fullWidth sx={{ mb: 2 }}>
                  <InputLabel>Leave Type</InputLabel>
                  <Select
                    value={lt.leaveType}
                    onChange={(e) => {
                      const newLeaveTypes = [...formData.leaveTypes];
                      newLeaveTypes[index].leaveType = e.target.value;
                      setFormData({ ...formData, leaveTypes: newLeaveTypes });
                    }}
                    label="Leave Type"
                  >
                    {leaveTypes.map((type) => (
                      <MenuItem key={type._id} value={type._id}>
                        {type.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <TextField
                  label="Maximum Days"
                  type="number"
                  value={lt.maxDays}
                  onChange={(e) => {
                    const newLeaveTypes = [...formData.leaveTypes];
                    newLeaveTypes[index].maxDays = Number(e.target.value);
                    setFormData({ ...formData, leaveTypes: newLeaveTypes });
                  }}
                  fullWidth
                  required
                  sx={{ mb: 2 }}
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={lt.carryForward}
                      onChange={(e) => {
                        const newLeaveTypes = [...formData.leaveTypes];
                        newLeaveTypes[index].carryForward = e.target.checked;
                        setFormData({ ...formData, leaveTypes: newLeaveTypes });
                      }}
                    />
                  }
                  label="Allow Carry Forward"
                />
                {lt.carryForward && (
                  <TextField
                    label="Maximum Carry Forward Days"
                    type="number"
                    value={lt.maxCarryForwardDays}
                    onChange={(e) => {
                      const newLeaveTypes = [...formData.leaveTypes];
                      newLeaveTypes[index].maxCarryForwardDays = Number(e.target.value);
                      setFormData({ ...formData, leaveTypes: newLeaveTypes });
                    }}
                    fullWidth
                    required
                    sx={{ mb: 2 }}
                  />
                )}
                <FormControlLabel
                  control={
                    <Switch
                      checked={lt.encashment}
                      onChange={(e) => {
                        const newLeaveTypes = [...formData.leaveTypes];
                        newLeaveTypes[index].encashment = e.target.checked;
                        setFormData({ ...formData, leaveTypes: newLeaveTypes });
                      }}
                    />
                  }
                  label="Allow Encashment"
                />
                {lt.encashment && (
                  <>
                    <TextField
                      label="Maximum Encashment Days"
                      type="number"
                      value={lt.maxEncashmentDays}
                      onChange={(e) => {
                        const newLeaveTypes = [...formData.leaveTypes];
                        newLeaveTypes[index].maxEncashmentDays = Number(e.target.value);
                        setFormData({ ...formData, leaveTypes: newLeaveTypes });
                      }}
                      fullWidth
                      required
                      sx={{ mb: 2 }}
                    />
                    <TextField
                      label="Encashment Rate"
                      type="number"
                      value={lt.encashmentRate}
                      onChange={(e) => {
                        const newLeaveTypes = [...formData.leaveTypes];
                        newLeaveTypes[index].encashmentRate = Number(e.target.value);
                        setFormData({ ...formData, leaveTypes: newLeaveTypes });
                      }}
                      fullWidth
                      required
                      sx={{ mb: 2 }}
                    />
                  </>
                )}
              </Box>
            ))}
            <Button onClick={addLeaveType} sx={{ mb: 2 }}>
              Add Leave Type
            </Button>

            <Typography variant="h6" sx={{ mb: 2 }}>
              Approval Hierarchy
            </Typography>
            {formData.approvalHierarchy.map((level, index) => (
              <Box key={index} sx={{ mb: 2, p: 2, border: '1px solid #ddd', borderRadius: 1 }}>
                <Typography variant="subtitle1">Level {level.level}</Typography>
                <FormControl fullWidth>
                  <InputLabel>Role</InputLabel>
                  <Select
                    value={level.role}
                    onChange={(e) => {
                      const newHierarchy = [...formData.approvalHierarchy];
                      newHierarchy[index].role = e.target.value;
                      setFormData({ ...formData, approvalHierarchy: newHierarchy });
                    }}
                    label="Role"
                  >
                    <MenuItem value="SUPER_ADMIN">Super Admin</MenuItem>
                    <MenuItem value="ADMIN">Admin</MenuItem>
                    <MenuItem value="HR_MANAGER">HR Manager</MenuItem>
                    <MenuItem value="DEPARTMENT_MANAGER">Department Manager</MenuItem>
                  </Select>
                </FormControl>
              </Box>
            ))}
            <Button onClick={addApprovalLevel} sx={{ mb: 2 }}>
              Add Approval Level
            </Button>

            <Typography variant="h6" sx={{ mb: 2 }}>
              Notification Settings
            </Typography>
            <FormControlLabel
              control={
                <Switch
                  checked={formData.notificationSettings.notifyOnApply}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      notificationSettings: {
                        ...formData.notificationSettings,
                        notifyOnApply: e.target.checked,
                      },
                    })
                  }
                />
              }
              label="Notify on Apply"
            />
            <FormControlLabel
              control={
                <Switch
                  checked={formData.notificationSettings.notifyOnApprove}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      notificationSettings: {
                        ...formData.notificationSettings,
                        notifyOnApprove: e.target.checked,
                      },
                    })
                  }
                />
              }
              label="Notify on Approve"
            />
            <FormControlLabel
              control={
                <Switch
                  checked={formData.notificationSettings.notifyOnReject}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      notificationSettings: {
                        ...formData.notificationSettings,
                        notifyOnReject: e.target.checked,
                      },
                    })
                  }
                />
              }
              label="Notify on Reject"
            />
            <FormControlLabel
              control={
                <Switch
                  checked={formData.notificationSettings.notifyOnCancel}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      notificationSettings: {
                        ...formData.notificationSettings,
                        notifyOnCancel: e.target.checked,
                      },
                    })
                  }
                />
              }
              label="Notify on Cancel"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained" disabled={loading}>
            {loading ? <CircularProgress size={24} /> : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Description</TableCell>
              <TableCell>Leave Types</TableCell>
              <TableCell>Approval Levels</TableCell>
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
                  {policy.approvalHierarchy
                    .map((level) => `${level.level}: ${level.role}`)
                    .join(', ')}
                </TableCell>
                <TableCell>
                  {isAdmin && (
                    <>
                      <Button size="small" color="primary">
                        Edit
                      </Button>
                      <Button size="small" color="error">
                        Delete
                      </Button>
                    </>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default LeavePolicy; 