import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { getDonations } from '../../actions/donation';
import { getRequests } from '../../actions/request';
import { getFeedbacks } from '../../actions/feedback';
import { 
  Typography, 
  Container, 
  Paper, 
  Grid, 
  Card, 
  CardContent, 
  CircularProgress, 
  Box, 
  Button, 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  List, 
  ListItem, 
  ListItemText, 
  Chip, 
  IconButton,
  useTheme,
  useMediaQuery,
  Tab,
  Tabs,
  Divider
} from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { 
  Notifications as NotificationsIcon, 
  LocalShipping as LogisticsIcon,
  Dashboard as DashboardIcon,
  Assessment as AnalyticsIcon
} from '@mui/icons-material';
import axios from 'axios';
import { memo, useMemo, useCallback } from 'react'

const AdminDashboard = ({ 
  getDonations, 
  getRequests, 
  getFeedbacks, 
  donation: { donations, loading: donationsLoading }, 
  request: { requests, loading: requestsLoading }, 
  feedback: { feedbacks, loading: feedbacksLoading },
  auth: { user }
}) => {
  const [matchingDialogOpen, setMatchingDialogOpen] = useState(false);
  const [selectedDonation, setSelectedDonation] = useState(null);
  const [potentialMatches, setPotentialMatches] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [tabValue, setTabValue] = useState(0);
  const [logistics, setLogistics] = useState([]);
  const [logisticsLoading, setLogisticsLoading] = useState(false);
  
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isTablet = useMediaQuery(theme.breakpoints.down('lg'));

  useEffect(() => {
    getDonations();
    getRequests();
    getFeedbacks();
    fetchLogistics();
  }, [getDonations, getRequests, getFeedbacks]);

  // Fetch logistics data
  const fetchLogistics = async () => {
    setLogisticsLoading(true);
    try {
      const res = await axios.get('/api/logistics');
      setLogistics(res.data);
    } catch (err) {
      console.error('Error fetching logistics:', err);
      // Add more detailed error handling
      if (err.response?.status === 401) {
        console.error('Authentication failed - please login again');
      } else if (err.response?.status === 403) {
        console.error('Access denied - admin privileges required');
      } else if (err.response?.status === 500) {
        console.error('Server error - please try again later');
      } else {
        console.error('Network error - check if backend server is running');
      }
    } finally {
      setLogisticsLoading(false);
    }
  };

  // Function to find matches for a donation
  const findMatches = async (donation) => {
    try {
      const res = await axios.get(`/api/matching/donation/${donation._id}`);
      setPotentialMatches(res.data);
      setSelectedDonation(donation);
      setMatchingDialogOpen(true);
    } catch (err) {
      console.error('Error finding matches:', err);
    }
  };

  // Function to approve a match and send notification
  const approveMatch = async (donationId, requestId) => {
    try {
      await axios.post('/api/matching/approve', { donationId, requestId });
      // Send notification to recipient
      const request = requests.find(r => r._id === requestId);
      if (request && request.recipient) {
        await axios.post('/api/notifications', {
          recipientId: request.recipient._id,
          message: `Great news! Your request has been matched with a donation. A donor has provided the items you requested.`,
          type: 'donation_matched'
        });
      }
      setMatchingDialogOpen(false);
      // Refresh data
      getDonations();
      getRequests();
    } catch (err) {
      console.error('Error approving match:', err);
    }
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  if (donationsLoading || requestsLoading || feedbacksLoading) {
    return (
      <Container sx={{ display: 'flex', justifyContent: 'center', mt: 5 }}>
        <CircularProgress />
      </Container>
    );
  }

  // Calculate statistics
  const pendingDonations = donations.filter(d => d.status === 'pending');
  const pendingRequests = requests.filter(r => r.status === 'pending');
  const matchedDonations = donations.filter(d => d.recipient);
  const activeLogistics = logistics.filter(l => l.status !== 'delivered');

  return (
    <Container maxWidth="xl" sx={{ mt: 2, px: { xs: 1, sm: 2, md: 3 } }}>
      <Box sx={{ mb: 3 }}>
        <Typography variant={isMobile ? "h5" : "h4"} gutterBottom>
          Admin Dashboard
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          Welcome, {user && user.name}!
        </Typography>
      </Box>

      {/* Responsive Tabs for Mobile */}
      {isMobile && (
        <Paper sx={{ mb: 3 }}>
          <Tabs 
            value={tabValue} 
            onChange={handleTabChange} 
            variant="scrollable"
            scrollButtons="auto"
            allowScrollButtonsMobile
          >
            <Tab icon={<DashboardIcon />} label="Overview" />
            <Tab icon={<LogisticsIcon />} label="Logistics" />
            <Tab icon={<AnalyticsIcon />} label="Analytics" />
          </Tabs>
        </Paper>
      )}

      {/* Overview Section */}
      {(!isMobile || tabValue === 0) && (
        <>
          {/* Enhanced Overview Cards with Responsive Grid */}
          <Grid container spacing={{ xs: 1, sm: 2, md: 3 }} sx={{ mb: 3 }}>
            <Grid item xs={6} sm={6} md={3}>
              <Card sx={{ height: '100%' }}>
                <CardContent sx={{ p: { xs: 1, sm: 2 } }}>
                  <Typography variant={isMobile ? "subtitle1" : "h6"} gutterBottom>
                    Total Donations
                  </Typography>
                  <Typography variant={isMobile ? "h5" : "h3"} color="primary">
                    {donations.length}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {pendingDonations.length} pending
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={6} sm={6} md={3}>
              <Card sx={{ height: '100%' }}>
                <CardContent sx={{ p: { xs: 1, sm: 2 } }}>
                  <Typography variant={isMobile ? "subtitle1" : "h6"} gutterBottom>
                    Total Requests
                  </Typography>
                  <Typography variant={isMobile ? "h5" : "h3"} color="secondary">
                    {requests.length}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {pendingRequests.length} pending
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={6} sm={6} md={3}>
              <Card sx={{ height: '100%' }}>
                <CardContent sx={{ p: { xs: 1, sm: 2 } }}>
                  <Typography variant={isMobile ? "subtitle1" : "h6"} gutterBottom>
                    Successful Matches
                  </Typography>
                  <Typography variant={isMobile ? "h5" : "h3"} color="success.main">
                    {matchedDonations.length}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {donations.length > 0 ? ((matchedDonations.length / donations.length) * 100).toFixed(1) : 0}% match rate
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={6} sm={6} md={3}>
              <Card sx={{ height: '100%' }}>
                <CardContent sx={{ p: { xs: 1, sm: 2 } }}>
                  <Typography variant={isMobile ? "subtitle1" : "h6"} gutterBottom>
                    Active Logistics
                  </Typography>
                  <Typography variant={isMobile ? "h5" : "h3"} color="warning.main">
                    {activeLogistics.length}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {feedbacks.length} total feedbacks
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Donation Matching Section */}
          <Paper sx={{ p: { xs: 1, sm: 2, md: 3 }, mb: 3 }}>
            <Typography variant={isMobile ? "h6" : "h5"} gutterBottom>
              Donation Matching Center
            </Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Match pending donations with recipient requests
            </Typography>
            {pendingDonations.length > 0 ? (
              <Grid container spacing={{ xs: 1, sm: 2 }}>
                {pendingDonations.slice(0, isMobile ? 2 : 6).map(donation => (
                  <Grid item xs={12} sm={6} md={4} key={donation._id}>
                    <Box sx={{ 
                      p: { xs: 1, sm: 2 }, 
                      border: '1px solid #eee', 
                      borderRadius: 1,
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column'
                    }}>
                      <Typography variant="subtitle2" sx={{ mb: 1 }}>
                        {donation.items.map(i => i.itemName).join(', ')}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ mb: 2, flexGrow: 1 }}>
                        By: {donation.donor ? donation.donor.name : 'N/A'} | {new Date(donation.donationDate).toLocaleDateString()}
                      </Typography>
                      <Button 
                        size="small" 
                        variant="outlined" 
                        onClick={() => findMatches(donation)}
                        fullWidth={isMobile}
                      >
                        Find Matches
                      </Button>
                    </Box>
                  </Grid>
                ))}
              </Grid>
            ) : (
              <Typography>No pending donations to match.</Typography>
            )}
          </Paper>

          {/* Quick Actions */}
          <Paper sx={{ p: { xs: 1, sm: 2, md: 3 }, mb: 3 }}>
            <Typography variant={isMobile ? "h6" : "h5"} gutterBottom>
              Quick Actions
            </Typography>
            <Box sx={{ 
              display: 'flex', 
              flexDirection: { xs: 'column', sm: 'row' },
              gap: 1,
              flexWrap: 'wrap'
            }}>
              <Button 
                variant="contained" 
                component={RouterLink} 
                to="/analytics"
                fullWidth={isMobile}
                startIcon={<AnalyticsIcon />}
              >
                View Analytics
              </Button>
              <Button 
                variant="outlined" 
                component={RouterLink} 
                to="/notifications"
                fullWidth={isMobile}
                startIcon={<NotificationsIcon />}
              >
                Manage Notifications
              </Button>
              <Button 
                variant="outlined" 
                component={RouterLink} 
                to="/admin/logistics"
                fullWidth={isMobile}
                startIcon={<LogisticsIcon />}
              >
                Logistics Management
              </Button>
            </Box>
          </Paper>

          {/* Recent Data Sections */}
          <Grid container spacing={{ xs: 1, sm: 2, md: 3 }}>
            <Grid item xs={12} lg={6}>
              <Paper sx={{ p: { xs: 1, sm: 2 }, height: '100%' }}>
                <Typography variant={isMobile ? "h6" : "h5"} gutterBottom>
                  Recent Donations
                </Typography>
                {donations.slice(0, isMobile ? 3 : 5).map(d => (
                  <Box key={d._id} sx={{ 
                    mb: 1, 
                    p: { xs: 1, sm: 1.5 }, 
                    border: '1px solid #eee', 
                    borderRadius: 1 
                  }}>
                    <Box sx={{ 
                      display: 'flex', 
                      flexDirection: { xs: 'column', sm: 'row' },
                      justifyContent: 'space-between', 
                      alignItems: { xs: 'flex-start', sm: 'center' },
                      gap: 1
                    }}>
                      <Box sx={{ flexGrow: 1 }}>
                        <Typography variant="subtitle2">
                          {d.items.map(i => i.itemName).join(', ')}
                        </Typography>
                        <Typography variant="caption">
                          Status: {d.status} | By: {d.donor ? d.donor.name : 'N/A'}
                        </Typography>
                      </Box>
                      {d.status === 'pending' && (
                        <Button 
                          size="small" 
                          onClick={() => findMatches(d)}
                          fullWidth={isMobile}
                        >
                          Match
                        </Button>
                      )}
                    </Box>
                  </Box>
                ))}
                {donations.length === 0 && <Typography>No donations yet.</Typography>}
              </Paper>
            </Grid>

            <Grid item xs={12} lg={6}>
              <Paper sx={{ p: { xs: 1, sm: 2 }, height: '100%' }}>
                <Typography variant={isMobile ? "h6" : "h5"} gutterBottom>
                  Recent Requests
                </Typography>
                {requests.slice(0, isMobile ? 3 : 5).map(r => (
                  <Box key={r._id} sx={{ 
                    mb: 1, 
                    p: { xs: 1, sm: 1.5 }, 
                    border: '1px solid #eee', 
                    borderRadius: 1 
                  }}>
                    <Box sx={{ 
                      display: 'flex', 
                      flexDirection: { xs: 'column', sm: 'row' },
                      justifyContent: 'space-between', 
                      alignItems: { xs: 'flex-start', sm: 'center' },
                      gap: 1
                    }}>
                      <Box sx={{ flexGrow: 1 }}>
                        <Typography variant="subtitle2">
                          {r.itemType} (Qty: {r.quantity})
                        </Typography>
                        <Typography variant="caption">
                          Status: {r.status} | By: {r.recipient ? r.recipient.name : 'N/A'}
                        </Typography>
                      </Box>
                      <Chip 
                        label={r.urgency} 
                        size="small" 
                        color={r.urgency === 'critical' ? 'error' : r.urgency === 'high' ? 'warning' : 'default'}
                      />
                    </Box>
                  </Box>
                ))}
                {requests.length === 0 && <Typography>No requests yet.</Typography>}
              </Paper>
            </Grid>
          </Grid>
        </>
      )}

      {/* Logistics Section for Mobile Tab */}
      {isMobile && tabValue === 1 && (
        <Paper sx={{ p: 2 }}>
          <Typography variant="h6" gutterBottom>
            Logistics Overview
          </Typography>
          <Button 
            variant="contained" 
            component={RouterLink} 
            to="/admin/logistics"
            fullWidth
            startIcon={<LogisticsIcon />}
          >
            Open Logistics Management
          </Button>
        </Paper>
      )}

      {/* Analytics Section for Mobile Tab */}
      {isMobile && tabValue === 2 && (
        <Paper sx={{ p: 2 }}>
          <Typography variant="h6" gutterBottom>
            Analytics Overview
          </Typography>
          <Button 
            variant="contained" 
            component={RouterLink} 
            to="/analytics"
            fullWidth
            startIcon={<AnalyticsIcon />}
          >
            View Full Analytics
          </Button>
        </Paper>
      )}

      {/* Matching Dialog */}
      <Dialog 
        open={matchingDialogOpen} 
        onClose={() => setMatchingDialogOpen(false)} 
        maxWidth="md" 
        fullWidth
        fullScreen={isMobile}
      >
        <DialogTitle>
          Find Matches for Donation: {selectedDonation && selectedDonation.items.map(i => i.itemName).join(', ')}
        </DialogTitle>
        <DialogContent>
          {potentialMatches.length > 0 ? (
            <List>
              {potentialMatches.map(request => (
                <ListItem key={request._id} sx={{ 
                  border: '1px solid #eee', 
                  mb: 1, 
                  borderRadius: 1,
                  flexDirection: { xs: 'column', sm: 'row' },
                  alignItems: { xs: 'stretch', sm: 'center' }
                }}>
                  <ListItemText
                    sx={{ mb: { xs: 1, sm: 0 } }}
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                        <Typography variant="subtitle1">{request.itemType} (Qty: {request.quantity})</Typography>
                        <Chip 
                          label={request.urgency} 
                          size="small" 
                          color={request.urgency === 'critical' ? 'error' : request.urgency === 'high' ? 'warning' : 'default'}
                        />
                      </Box>
                    }
                    secondary={
                      <>
                        <Typography component="span" variant="body2">
                          Requested by: {request.recipient ? request.recipient.name : 'N/A'}
                        </Typography>
                        <br />
                        <Typography component="span" variant="caption">
                          Request Date: {new Date(request.requestDate).toLocaleDateString()}
                        </Typography>
                        {request.description && (
                          <>
                            <br />
                            <Typography component="span" variant="caption">
                              Description: {request.description}
                            </Typography>
                          </>
                        )}
                      </>
                    }
                  />
                  <Button 
                    variant="contained" 
                    color="primary"
                    onClick={() => approveMatch(selectedDonation._id, request._id)}
                    fullWidth={isMobile}
                    sx={{ minWidth: { sm: 'auto' } }}
                  >
                    Approve Match
                  </Button>
                </ListItem>
              ))}
            </List>
          ) : (
            <Typography>No matching requests found for this donation.</Typography>
          )}
        </DialogContent>
      </Dialog>
    </Container>
  );
};

AdminDashboard.propTypes = {
  getDonations: PropTypes.func.isRequired,
  getRequests: PropTypes.func.isRequired,
  getFeedbacks: PropTypes.func.isRequired,
  donation: PropTypes.object.isRequired,
  request: PropTypes.object.isRequired,
  feedback: PropTypes.object.isRequired,
  auth: PropTypes.object.isRequired
};

const mapStateToProps = (state) => ({
  donation: state.donation,
  request: state.request,
  feedback: state.feedback,
  auth: state.auth
});

export default connect(mapStateToProps, { getDonations, getRequests, getFeedbacks })(AdminDashboard);

// REMOVE EVERYTHING AFTER THIS LINE - the duplicate AdminDashboard declaration
