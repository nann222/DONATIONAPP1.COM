import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Box,
  IconButton,
  Tooltip,
  useTheme,
  useMediaQuery,
  Tabs,
  Tab,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Divider,
  Alert,
  CircularProgress
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  LocalShipping as ShippingIcon,
  Schedule as ScheduleIcon,
  CheckCircle as DeliveredIcon,
  LocationOn as LocationIcon,
  Phone as PhoneIcon,
  Email as EmailIcon
} from '@mui/icons-material';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import axios from 'axios';

const LogisticsManagement = () => {
  const [logistics, setLogistics] = useState([]);
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingLogistics, setEditingLogistics] = useState(null);
  const [tabValue, setTabValue] = useState(0);
  const [formData, setFormData] = useState({
    donation: '',
    pickupAddress: '',
    deliveryAddress: '',
    pickupDate: new Date(),
    deliveryDate: new Date(),
    status: 'scheduled',
    provider: '',
    driverName: '',
    driverPhone: '',
    vehicleInfo: '',
    notes: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  useEffect(() => {
    fetchLogistics();
    fetchDonations();
  }, []);

  const fetchLogistics = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/api/logistics');
      setLogistics(res.data);
      setError(''); // Clear any previous errors
    } catch (err) {
      console.error('Error fetching logistics:', err);
      if (err.response?.status === 401) {
        setError('Authentication failed. Please login again.');
      } else if (err.response?.status === 403) {
        setError('Access denied. Admin privileges required.');
      } else if (err.response?.status === 500) {
        setError('Server error. Please try again later.');
      } else if (err.code === 'ECONNREFUSED' || !err.response) {
        setError('Cannot connect to server. Please ensure the backend server is running.');
      } else {
        setError('Failed to fetch logistics data. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchDonations = async () => {
    try {
      const res = await axios.get('/api/donations');
      // Filter donations that are matched but don't have logistics yet
      const matchedDonations = res.data.filter(d => d.recipient && d.status === 'matched');
      setDonations(matchedDonations);
    } catch (err) {
      console.error('Error fetching donations:', err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingLogistics) {
        await axios.put(`/api/logistics/${editingLogistics._id}`, formData);
        setSuccess('Logistics updated successfully!');
      } else {
        await axios.post('/api/logistics', formData);
        setSuccess('Logistics created successfully!');
      }
      setDialogOpen(false);
      setEditingLogistics(null);
      resetForm();
      fetchLogistics();
    } catch (err) {
      setError(err.response?.data?.msg || 'Error saving logistics');
    }
  };

  const handleEdit = (logisticsItem) => {
    setEditingLogistics(logisticsItem);
    setFormData({
      donation: logisticsItem.donation._id,
      pickupAddress: logisticsItem.pickupAddress,
      deliveryAddress: logisticsItem.deliveryAddress,
      pickupDate: new Date(logisticsItem.pickupDate),
      deliveryDate: new Date(logisticsItem.deliveryDate),
      status: logisticsItem.status,
      provider: logisticsItem.provider || '',
      driverName: logisticsItem.driverName || '',
      driverPhone: logisticsItem.driverPhone || '',
      vehicleInfo: logisticsItem.vehicleInfo || '',
      notes: logisticsItem.notes || ''
    });
    setDialogOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this logistics entry?')) {
      try {
        await axios.delete(`/api/logistics/${id}`);
        setSuccess('Logistics deleted successfully!');
        fetchLogistics();
      } catch (err) {
        setError('Error deleting logistics');
      }
    }
  };

  const updateStatus = async (id, newStatus) => {
    try {
      await axios.put(`/api/logistics/${id}`, { status: newStatus });
      setSuccess('Status updated successfully!');
      fetchLogistics();
    } catch (err) {
      setError('Error updating status');
    }
  };

  const resetForm = () => {
    setFormData({
      donation: '',
      pickupAddress: '',
      deliveryAddress: '',
      pickupDate: new Date(),
      deliveryDate: new Date(),
      status: 'scheduled',
      provider: '',
      driverName: '',
      driverPhone: '',
      vehicleInfo: '',
      notes: ''
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'scheduled': return 'default';
      case 'picked-up': return 'info';
      case 'in-transit': return 'warning';
      case 'delivered': return 'success';
      default: return 'default';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'scheduled': return <ScheduleIcon />;
      case 'picked-up': return <ShippingIcon />;
      case 'in-transit': return <ShippingIcon />;
      case 'delivered': return <DeliveredIcon />;
      default: return <ScheduleIcon />;
    }
  };

  if (loading) {
    return (
      <Container sx={{ display: 'flex', justifyContent: 'center', mt: 5 }}>
        <CircularProgress />
      </Container>
    );
  }

  const activeLogistics = logistics.filter(l => l.status !== 'delivered');
  const completedLogistics = logistics.filter(l => l.status === 'delivered');

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Container maxWidth="xl" sx={{ mt: 2, px: { xs: 1, sm: 2, md: 3 } }}>
        <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
          <Typography variant={isMobile ? "h5" : "h4"} gutterBottom>
            Logistics Management
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => {
              setEditingLogistics(null);
              resetForm();
              setDialogOpen(true);
            }}
            fullWidth={isMobile}
          >
            Schedule Delivery
          </Button>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>
            {success}
          </Alert>
        )}

        {/* Statistics Cards */}
        <Grid container spacing={{ xs: 1, sm: 2, md: 3 }} sx={{ mb: 3 }}>
          <Grid item xs={6} sm={3}>
            <Card>
              <CardContent sx={{ p: { xs: 1, sm: 2 } }}>
                <Typography variant={isMobile ? "subtitle2" : "h6"} gutterBottom>
                  Active Deliveries
                </Typography>
                <Typography variant={isMobile ? "h5" : "h3"} color="primary">
                  {activeLogistics.length}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Card>
              <CardContent sx={{ p: { xs: 1, sm: 2 } }}>
                <Typography variant={isMobile ? "subtitle2" : "h6"} gutterBottom>
                  Completed
                </Typography>
                <Typography variant={isMobile ? "h5" : "h3"} color="success.main">
                  {completedLogistics.length}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Card>
              <CardContent sx={{ p: { xs: 1, sm: 2 } }}>
                <Typography variant={isMobile ? "subtitle2" : "h6"} gutterBottom>
                  In Transit
                </Typography>
                <Typography variant={isMobile ? "h5" : "h3"} color="warning.main">
                  {logistics.filter(l => l.status === 'in-transit').length}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Card>
              <CardContent sx={{ p: { xs: 1, sm: 2 } }}>
                <Typography variant={isMobile ? "subtitle2" : "h6"} gutterBottom>
                  Scheduled
                </Typography>
                <Typography variant={isMobile ? "h5" : "h3"} color="info.main">
                  {logistics.filter(l => l.status === 'scheduled').length}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Tabs for Mobile */}
        {isMobile && (
          <Paper sx={{ mb: 2 }}>
            <Tabs value={tabValue} onChange={(e, v) => setTabValue(v)} variant="fullWidth">
              <Tab label="Active" />
              <Tab label="Completed" />
            </Tabs>
          </Paper>
        )}

        {/* Desktop View */}
        {!isMobile && (
          <Grid container spacing={3}>
            <Grid item xs={12} lg={8}>
              <Paper sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom>
                  Active Logistics
                </Typography>
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Donation</TableCell>
                        <TableCell>Route</TableCell>
                        <TableCell>Status</TableCell>
                        <TableCell>Pickup Date</TableCell>
                        <TableCell>Delivery Date</TableCell>
                        <TableCell>Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {activeLogistics.map((item) => (
                        <TableRow key={item._id}>
                          <TableCell>
                            <Typography variant="subtitle2">
                              {item.donation?.items?.map(i => i.itemName).join(', ') || 'N/A'}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              ID: {item.donation?.trackingId || 'N/A'}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Box>
                              <Typography variant="caption" display="block">
                                From: {item.pickupAddress}
                              </Typography>
                              <Typography variant="caption" display="block">
                                To: {item.deliveryAddress}
                              </Typography>
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Chip
                              icon={getStatusIcon(item.status)}
                              label={item.status}
                              color={getStatusColor(item.status)}
                              size="small"
                            />
                          </TableCell>
                          <TableCell>
                            {new Date(item.pickupDate).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            {new Date(item.deliveryDate).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            <Box sx={{ display: 'flex', gap: 1 }}>
                              <Tooltip title="Edit">
                                <IconButton size="small" onClick={() => handleEdit(item)}>
                                  <EditIcon />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Delete">
                                <IconButton size="small" onClick={() => handleDelete(item._id)}>
                                  <DeleteIcon />
                                </IconButton>
                              </Tooltip>
                              {item.status !== 'delivered' && (
                                <Select
                                  size="small"
                                  value={item.status}
                                  onChange={(e) => updateStatus(item._id, e.target.value)}
                                >
                                  <MenuItem value="scheduled">Scheduled</MenuItem>
                                  <MenuItem value="picked-up">Picked Up</MenuItem>
                                  <MenuItem value="in-transit">In Transit</MenuItem>
                                  <MenuItem value="delivered">Delivered</MenuItem>
                                </Select>
                              )}
                            </Box>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Paper>
            </Grid>
            <Grid item xs={12} lg={4}>
              <Paper sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom>
                  Recent Completed
                </Typography>
                <List>
                  {completedLogistics.slice(0, 5).map((item) => (
                    <React.Fragment key={item._id}>
                      <ListItem>
                        <ListItemText
                          primary={item.donation?.items?.map(i => i.itemName).join(', ') || 'N/A'}
                          secondary={`Delivered on ${new Date(item.deliveryDate).toLocaleDateString()}`}
                        />
                        <ListItemSecondaryAction>
                          <Chip label="Delivered" color="success" size="small" />
                        </ListItemSecondaryAction>
                      </ListItem>
                      <Divider />
                    </React.Fragment>
                  ))}
                </List>
              </Paper>
            </Grid>
          </Grid>
        )}

        {/* Mobile View */}
        {isMobile && (
          <Paper sx={{ p: 1 }}>
            {tabValue === 0 && (
              <List>
                {activeLogistics.map((item) => (
                  <React.Fragment key={item._id}>
                    <ListItem sx={{ flexDirection: 'column', alignItems: 'stretch' }}>
                      <Box sx={{ width: '100%', mb: 1 }}>
                        <Typography variant="subtitle2">
                          {item.donation?.items?.map(i => i.itemName).join(', ') || 'N/A'}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          ID: {item.donation?.trackingId || 'N/A'}
                        </Typography>
                      </Box>
                      <Box sx={{ width: '100%', mb: 1 }}>
                        <Typography variant="caption" display="block">
                          <LocationIcon sx={{ fontSize: 12, mr: 0.5 }} />
                          From: {item.pickupAddress}
                        </Typography>
                        <Typography variant="caption" display="block">
                          <LocationIcon sx={{ fontSize: 12, mr: 0.5 }} />
                          To: {item.deliveryAddress}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Chip
                          icon={getStatusIcon(item.status)}
                          label={item.status}
                          color={getStatusColor(item.status)}
                          size="small"
                        />
                        <Box>
                          <IconButton size="small" onClick={() => handleEdit(item)}>
                            <EditIcon />
                          </IconButton>
                          <IconButton size="small" onClick={() => handleDelete(item._id)}>
                            <DeleteIcon />
                          </IconButton>
                        </Box>
                      </Box>
                    </ListItem>
                    <Divider />
                  </React.Fragment>
                ))}
              </List>
            )}
            {tabValue === 1 && (
              <List>
                {completedLogistics.map((item) => (
                  <React.Fragment key={item._id}>
                    <ListItem>
                      <ListItemText
                        primary={item.donation?.items?.map(i => i.itemName).join(', ') || 'N/A'}
                        secondary={`Delivered on ${new Date(item.deliveryDate).toLocaleDateString()}`}
                      />
                      <ListItemSecondaryAction>
                        <Chip label="Delivered" color="success" size="small" />
                      </ListItemSecondaryAction>
                    </ListItem>
                    <Divider />
                  </React.Fragment>
                ))}
              </List>
            )}
          </Paper>
        )}

        {/* Create/Edit Dialog */}
        <Dialog 
          open={dialogOpen} 
          onClose={() => setDialogOpen(false)} 
          maxWidth="md" 
          fullWidth
          fullScreen={isMobile}
        >
          <DialogTitle>
            {editingLogistics ? 'Edit Logistics' : 'Schedule New Delivery'}
          </DialogTitle>
          <form onSubmit={handleSubmit}>
            <DialogContent>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <FormControl fullWidth>
                    <InputLabel>Donation</InputLabel>
                    <Select
                      value={formData.donation}
                      onChange={(e) => setFormData({ ...formData, donation: e.target.value })}
                      required
                    >
                      {donations.map((donation) => (
                        <MenuItem key={donation._id} value={donation._id}>
                          {donation.items.map(i => i.itemName).join(', ')} - {donation.trackingId}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Pickup Address"
                    value={formData.pickupAddress}
                    onChange={(e) => setFormData({ ...formData, pickupAddress: e.target.value })}
                    required
                    multiline
                    rows={2}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Delivery Address"
                    value={formData.deliveryAddress}
                    onChange={(e) => setFormData({ ...formData, deliveryAddress: e.target.value })}
                    required
                    multiline
                    rows={2}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <DateTimePicker
                    label="Pickup Date"
                    value={formData.pickupDate}
                    onChange={(date) => setFormData({ ...formData, pickupDate: date })}
                    renderInput={(params) => <TextField {...params} fullWidth />}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <DateTimePicker
                    label="Delivery Date"
                    value={formData.deliveryDate}
                    onChange={(date) => setFormData({ ...formData, deliveryDate: date })}
                    renderInput={(params) => <TextField {...params} fullWidth />}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel>Status</InputLabel>
                    <Select
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    >
                      <MenuItem value="scheduled">Scheduled</MenuItem>
                      <MenuItem value="picked-up">Picked Up</MenuItem>
                      <MenuItem value="in-transit">In Transit</MenuItem>
                      <MenuItem value="delivered">Delivered</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Logistics Provider"
                    value={formData.provider}
                    onChange={(e) => setFormData({ ...formData, provider: e.target.value })}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Driver Name"
                    value={formData.driverName}
                    onChange={(e) => setFormData({ ...formData, driverName: e.target.value })}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Driver Phone"
                    value={formData.driverPhone}
                    onChange={(e) => setFormData({ ...formData, driverPhone: e.target.value })}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Vehicle Information"
                    value={formData.vehicleInfo}
                    onChange={(e) => setFormData({ ...formData, vehicleInfo: e.target.value })}
                    placeholder="Vehicle type, license plate, etc."
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Notes"
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    multiline
                    rows={3}
                    placeholder="Special instructions, contact information, etc."
                  />
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
              <Button type="submit" variant="contained">
                {editingLogistics ? 'Update' : 'Create'}
              </Button>
            </DialogActions>
          </form>
        </Dialog>
      </Container>
    </LocalizationProvider>
  );
};

export default LogisticsManagement;