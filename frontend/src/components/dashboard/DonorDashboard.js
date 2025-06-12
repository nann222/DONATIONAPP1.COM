import React, { useEffect } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { getDonations } from '../../actions/donation';
import { getRequests } from '../../actions/request'; // Add this import
import { Typography, Container, Paper, Grid, Card, CardContent, CircularProgress, Box, Button, List, ListItem, ListItemText, Divider, Chip } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';

const DonorDashboard = ({ 
  getDonations, 
  getRequests, // Add this prop
  donation: { donations, loading }, 
  request: { requests, loading: requestsLoading }, // Add this prop
  auth: { user }
}) => {
  useEffect(() => {
    getDonations();
    getRequests(); // Fetch all pending requests
  }, [getDonations, getRequests]);

  if (loading || requestsLoading) {
    return (
      <Container sx={{ display: 'flex', justifyContent: 'center', mt: 5 }}>
        <CircularProgress />
      </Container>
    );
  }

  // Filter pending requests
  const pendingRequests = requests.filter(r => r.status === 'pending');

  return (
    <Container sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>
        Donor Dashboard
      </Typography>
      <Typography variant="subtitle1" gutterBottom>
        Welcome, {user && user.name}!
      </Typography>

      <Grid container spacing={3} sx={{ mt: 2 }}>
        {/* Existing donations section */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>Your Recent Donations</Typography>
            {donations && donations.length > 0 ? (
              <List>
                {donations.slice(0, 5).map((d) => (
                  <React.Fragment key={d._id}>
                    <ListItem alignItems="flex-start">
                      <ListItemText
                        primary={`Donation ID: ${d.trackingId}`}
                        secondary={
                          <>
                            <Typography component="span" variant="body2" color="text.primary">
                              Status: {d.status}
                            </Typography>
                            {` - Items: ${d.items.map(i => i.itemName).join(', ')}`}
                            {d.recipient && ` - Given to: ${d.recipient.name}`}
                          </>
                        }
                      />
                      <Button component={RouterLink} to={`/tracking/${d._id}`} size="small">View Details</Button>
                    </ListItem>
                    <Divider variant="inset" component="li" />
                  </React.Fragment>
                ))}
              </List>
            ) : (
              <Typography>You haven't made any donations yet.</Typography>
            )}
          </Paper>
        </Grid>

        {/* NEW: Available Requests Section */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>Available Requests - Help Needed!</Typography>
            {pendingRequests && pendingRequests.length > 0 ? (
              <List>
                {pendingRequests.slice(0, 5).map((r) => (
                  <React.Fragment key={r._id}>
                    <ListItem alignItems="flex-start">
                      <ListItemText
                        primary={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography variant="subtitle2">{r.itemType}</Typography>
                            <Chip 
                              label={r.urgency} 
                              size="small" 
                              color={r.urgency === 'critical' ? 'error' : r.urgency === 'high' ? 'warning' : 'default'}
                            />
                          </Box>
                        }
                        secondary={
                          <>
                            <Typography component="span" variant="body2" color="text.primary">
                              Quantity: {r.quantity}
                            </Typography>
                            <br />
                            {`Requested by: ${r.recipient ? r.recipient.name : 'N/A'}`}
                            {r.description && <><br />{`Description: ${r.description}`}</>}
                          </>
                        }
                      />
                      <Button 
                        component={RouterLink} 
                        to={`/donation/new?requestId=${r._id}`} 
                        size="small" 
                        variant="contained"
                        color="primary"
                      >
                        Donate
                      </Button>
                    </ListItem>
                    <Divider variant="inset" component="li" />
                  </React.Fragment>
                ))}
              </List>
            ) : (
              <Typography>No pending requests at the moment.</Typography>
            )}
            {pendingRequests.length > 5 && (
              <Button component={RouterLink} to="/requests" sx={{ mt: 1 }}>
                View All Requests
              </Button>
            )}
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>Quick Actions</Typography>
            <Button fullWidth variant="contained" component={RouterLink} to="/donation/new" sx={{ mb: 1 }}>
              Make a New Donation
            </Button>
            <Button fullWidth variant="outlined" component={RouterLink} to="/requests" sx={{ mb: 1 }}>
              Browse All Requests
            </Button>
          </Paper>
          <Card sx={{ mt: 2}}>
            <CardContent>
                <Typography variant="h5">Total Donations Made</Typography>
                <Typography variant="h3">{donations.length}</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
};

DonorDashboard.propTypes = {
  getDonations: PropTypes.func.isRequired,
  getRequests: PropTypes.func.isRequired, // Add this
  donation: PropTypes.object.isRequired,
  request: PropTypes.object.isRequired, // Add this
  auth: PropTypes.object.isRequired
};

const mapStateToProps = (state) => ({
  donation: state.donation,
  request: state.request, // Add this
  auth: state.auth
});

export default connect(mapStateToProps, { getDonations, getRequests })(DonorDashboard);