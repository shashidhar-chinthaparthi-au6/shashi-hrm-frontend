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
  CircularProgress,
  Tabs,
  Tab,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Chip,
  SelectChangeEvent,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../store';
import { fetchEmployees, createEmployee, updateEmployee, deleteEmployee } from '../store/employeeSlice';
import { showToast } from '../store/toastSlice';
import { employeeService, Employee, Address, EmergencyContact } from '../services/employee.service';

type EmployeeFormData = Omit<Employee, '_id' | 'directReports' | 'documents'>;

const initialFormData: EmployeeFormData = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  department: '',
  position: '',
  role: 'EMPLOYEE',
  salary: 0,
  status: 'active',
  joiningDate: new Date().toISOString().split('T')[0],
  address: {
    street: '',
    city: '',
    state: '',
    country: '',
    zipCode: '',
  },
  emergencyContact: {
    name: '',
    relationship: '',
    phone: '',
  },
};

const Employees = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { employees, loading, error } = useSelector((state: RootState) => state.employees);
  const { user } = useSelector((state: RootState) => state.auth);
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState<EmployeeFormData>(initialFormData);
  const [editMode, setEditMode] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<string | null>(null);
  const [selectedTab, setSelectedTab] = useState(0);
  const [selectedEmployeeDetails, setSelectedEmployeeDetails] = useState<Employee | null>(null);
  const [directReports, setDirectReports] = useState<Employee[]>([]);
  const [documents, setDocuments] = useState<any[]>([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  useEffect(() => {
    dispatch(fetchEmployees());
  }, [dispatch]);

  useEffect(() => {
    if (selectedEmployeeDetails) {
      loadEmployeeDetails(selectedEmployeeDetails._id);
    }
  }, [selectedEmployeeDetails]);

  const loadEmployeeDetails = async (employeeId: string) => {
    try {
      const [reportsResponse, docsResponse] = await Promise.all([
        employeeService.getDirectReports(employeeId),
        employeeService.getDocuments(employeeId),
      ]);
      setDirectReports(reportsResponse.data);
      setDocuments(docsResponse.data);
    } catch (error) {
      dispatch(showToast({ message: 'Failed to load employee details', severity: 'error' }));
    }
  };

  const handleOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setFormData(initialFormData);
    setEditMode(false);
    setSelectedEmployee(null);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | SelectChangeEvent<string>) => {
    const { name, value } = e.target;
    
    if (name.startsWith('address.')) {
      const field = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        address: {
          ...prev.address,
          [field]: value
        }
      }));
    } else if (name.startsWith('emergencyContact.')) {
      const field = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        emergencyContact: {
          ...prev.emergencyContact,
          [field]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleStatusChange = (e: SelectChangeEvent<'active' | 'inactive' | 'on_leave'>) => {
    setFormData(prev => ({
      ...prev,
      status: e.target.value as 'active' | 'inactive' | 'on_leave'
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      console.log('Submitting form data:', formData);
      if (editMode && selectedEmployee) {
        await dispatch(updateEmployee({ id: selectedEmployee, data: formData })).unwrap();
        dispatch(showToast({ message: 'Employee updated successfully', severity: 'success' }));
      } else {
        await dispatch(createEmployee(formData)).unwrap();
        dispatch(showToast({ message: 'Employee created successfully', severity: 'success' }));
      }
      handleClose();
    } catch (error) {
      console.error('Error submitting form:', error);
      dispatch(showToast({ message: 'Operation failed', severity: 'error' }));
    }
  };

  const handleEdit = (employee: Employee) => {
    const { _id, directReports, documents, ...formData } = employee;
    setFormData(formData as EmployeeFormData);
    setSelectedEmployee(_id);
    setEditMode(true);
    setOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this employee?')) {
      try {
        await dispatch(deleteEmployee(id)).unwrap();
        dispatch(showToast({ message: 'Employee deleted successfully', severity: 'success' }));
      } catch (error) {
        dispatch(showToast({ message: 'Failed to delete employee', severity: 'error' }));
      }
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleFileUpload = async () => {
    if (!selectedFile || !selectedEmployeeDetails) return;

    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      await employeeService.uploadDocument(selectedEmployeeDetails._id, formData);
      dispatch(showToast({ message: 'Document uploaded successfully', severity: 'success' }));
      loadEmployeeDetails(selectedEmployeeDetails._id);
      setSelectedFile(null);
    } catch (error) {
      dispatch(showToast({ message: 'Failed to upload document', severity: 'error' }));
    }
  };

  const handleDocumentDelete = async (documentId: string) => {
    if (!selectedEmployeeDetails) return;

    try {
      await employeeService.deleteDocument(selectedEmployeeDetails._id, documentId);
      dispatch(showToast({ message: 'Document deleted successfully', severity: 'success' }));
      loadEmployeeDetails(selectedEmployeeDetails._id);
    } catch (error) {
      dispatch(showToast({ message: 'Failed to delete document', severity: 'error' }));
    }
  };

  // Get available roles based on current user's role
  const getAvailableRoles = () => {
    if (!user) return ['EMPLOYEE'];
    
    switch (user.role) {
      case 'SUPER_ADMIN':
        return ['ADMIN', 'HR_MANAGER', 'DEPARTMENT_MANAGER', 'EMPLOYEE'];
      case 'ADMIN':
        return ['HR_MANAGER', 'DEPARTMENT_MANAGER', 'EMPLOYEE'];
      case 'HR_MANAGER':
        return ['EMPLOYEE'];
      default:
        return ['EMPLOYEE'];
    }
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
      <Box p={2}>
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Employees</Typography>
        <Button variant="contained" color="primary" onClick={handleOpen}>
          Add Employee
        </Button>
      </Box>

      <Box display="flex" gap={3}>
        <Box flex={2}>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Department</TableCell>
                  <TableCell>Position</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {employees.map((employee) => (
                  <TableRow key={employee._id}>
                    <TableCell>{`${employee.firstName} ${employee.lastName}`}</TableCell>
                    <TableCell>{employee.department}</TableCell>
                    <TableCell>{employee.position}</TableCell>
                    <TableCell>
                      <Chip
                        label={employee.status}
                        color={employee.status === 'active' ? 'success' : 'default'}
                      />
                    </TableCell>
                    <TableCell>
                      <IconButton onClick={() => handleEdit(employee)}>
                        <EditIcon />
                      </IconButton>
                      <IconButton onClick={() => handleDelete(employee._id)}>
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>

        {selectedEmployeeDetails && (
          <Box flex={1}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Employee Details
                </Typography>
                <List>
                  <ListItem>
                    <ListItemText
                      primary="Name"
                      secondary={`${selectedEmployeeDetails.firstName} ${selectedEmployeeDetails.lastName}`}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText
                      primary="Email"
                      secondary={selectedEmployeeDetails.email}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText
                      primary="Department"
                      secondary={selectedEmployeeDetails.department}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText
                      primary="Position"
                      secondary={selectedEmployeeDetails.position}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText
                      primary="Salary"
                      secondary={`$${selectedEmployeeDetails.salary}`}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText
                      primary="Status"
                      secondary={
                        <Chip
                          label={selectedEmployeeDetails.status}
                          color={selectedEmployeeDetails.status === 'active' ? 'success' : 'default'}
                        />
                      }
                    />
                  </ListItem>
                </List>
              </CardContent>
            </Card>
          </Box>
        )}
      </Box>

      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>{editMode ? 'Edit Employee' : 'Add Employee'}</DialogTitle>
        <DialogContent>
          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
            <TextField
              margin="normal"
              required
              fullWidth
              label="First Name"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              label="Last Name"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              label="Email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              label="Phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              label="Department"
              name="department"
              value={formData.department}
              onChange={handleChange}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              label="Position"
              name="position"
              value={formData.position}
              onChange={handleChange}
            />
            <FormControl fullWidth margin="normal">
              <InputLabel>Role</InputLabel>
              <Select
                name="role"
                value={formData.role}
                onChange={handleChange}
                label="Role"
              >
                {getAvailableRoles().map((role) => (
                  <MenuItem key={role} value={role}>
                    {role.split('_').map(word => word.charAt(0) + word.slice(1).toLowerCase()).join(' ')}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              margin="normal"
              required
              fullWidth
              label="Salary"
              name="salary"
              type="number"
              value={formData.salary}
              onChange={handleChange}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              label="Joining Date"
              name="joiningDate"
              type="date"
              value={formData.joiningDate}
              onChange={handleChange}
              InputLabelProps={{
                shrink: true,
              }}
            />
            <FormControl fullWidth margin="normal">
              <InputLabel>Status</InputLabel>
              <Select
                name="status"
                value={formData.status}
                onChange={handleStatusChange}
                label="Status"
              >
                <MenuItem value="active">Active</MenuItem>
                <MenuItem value="inactive">Inactive</MenuItem>
                <MenuItem value="on_leave">On Leave</MenuItem>
              </Select>
            </FormControl>
            <Typography variant="h6" sx={{ mt: 2 }}>Address</Typography>
            <TextField
              margin="normal"
              required
              fullWidth
              label="Street"
              name="address.street"
              value={formData.address.street}
              onChange={handleChange}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              label="City"
              name="address.city"
              value={formData.address.city}
              onChange={handleChange}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              label="State"
              name="address.state"
              value={formData.address.state}
              onChange={handleChange}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              label="Country"
              name="address.country"
              value={formData.address.country}
              onChange={handleChange}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              label="ZIP Code"
              name="address.zipCode"
              value={formData.address.zipCode}
              onChange={handleChange}
            />
            <Typography variant="h6" sx={{ mt: 2 }}>Emergency Contact</Typography>
            <TextField
              margin="normal"
              required
              fullWidth
              label="Name"
              name="emergencyContact.name"
              value={formData.emergencyContact.name}
              onChange={handleChange}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              label="Relationship"
              name="emergencyContact.relationship"
              value={formData.emergencyContact.relationship}
              onChange={handleChange}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              label="Phone"
              name="emergencyContact.phone"
              value={formData.emergencyContact.phone}
              onChange={handleChange}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained" color="primary">
            {editMode ? 'Update' : 'Add'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Employees; 