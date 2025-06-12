import React, { useEffect } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { getRequests } from '../../actions/request'; // Recipients see their requests
import { getDonations } from '../../actions/donation'; // Recipients see donations they received
import { Typography, Container, Paper, Grid, Card, CardContent, CircularProgress, Box, Button, List, ListItem, ListItemText, Divider } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';

const RecipientDashboard = ({
  getRequests,
  getDonations,
  request: { requests, loading: requestsLoading },
  donation: { donations, loading: donationsLoading }, // donations received by this recipient
  auth: { user }
}) => {
  useEffect(() => {
    getRequests();
    getDonations(); // This action should be smart enough to fetch donations for this recipient
  }, [getRequests, getDonations]);

  if (requestsLoading || donationsLoading) {
    return (
      <Container sx={{ display: 'flex', justifyContent: 'center', mt: 5 }}>
        <CircularProgress />
      </Container>
    );
  }
  
  // Filter donations to show only those where the current user is the recipient
  const receivedDonations = donations && Array.isArray(donations) 
    ? donations.filter(d => d.recipient && d.recipient._id === user._id)
    : [];

  return (
    <Container sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>
        Recipient Dashboard
      </Typography>
      <Typography variant="subtitle1" gutterBottom>
        Welcome, {user && user.name}!
      </Typography>

      <Grid container spacing={3} sx={{ mt: 2 }}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>Your Recent Requests</Typography>
            {requests && requests.length > 0 ? (
              <List>
                {requests.slice(0, 5).map((r) => (
                  <React.Fragment key={r._id}>
                    <ListItem alignItems="flex-start">
                      <ListItemText
                        primary={`Request for: ${r.itemType}`}
                        secondary={
                          <>
                            <Typography component="span" variant="body2" color="text.primary">
                              Status: {r.status}
                            </Typography>
                            {` - Quantity: ${r.quantity}, Urgency: ${r.urgency}`}
                          </>
                        }
                      />
                      {/* <Button component={RouterLink} to={`/request/details/${r._id}`} size="small">View Details</Button> */}
                    </ListItem>
                    <Divider variant="inset" component="li" />
                  </React.Fragment>
                ))}
              </List>
            ) : (
              <Typography>You haven't made any requests yet.</Typography>
            )}
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>Donations You've Received</Typography>
            {receivedDonations && receivedDonations.length > 0 ? (
              <List>
                {receivedDonations.slice(0, 5).map((d) => (
                  <React.Fragment key={d._id}>
                    <ListItem alignItems="flex-start">
                      <ListItemText
                        primary={`Donation ID: ${d.trackingId}`}
                        secondary={
                          <>
                            <Typography component="span" variant="body2" color="text.primary">
                              Status: {d.status}
                            </Typography>
                            {` - Items: ${d.items.map(i => i.itemName).join(', ')} From: ${d.donor ? d.donor.name : 'N/A'}`}
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
              <Typography>You haven't received any donations yet.</Typography>
            )}
          </Paper>
        </Grid>

        <Grid item xs={12}>
          <Paper sx={{ p: 2, mt:1 }}>
            <Typography variant="h6" gutterBottom>Quick Actions</Typography>
            <Button fullWidth variant="contained" component={RouterLink} to="/request/new" sx={{ mb: 1 }}>
              Make a New Request
            </Button>
            {/* Add other recipient-specific links */}
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

RecipientDashboard.propTypes = {
  getRequests: PropTypes.func.isRequired,
  getDonations: PropTypes.func.isRequired,
  request: PropTypes.object.isRequired,
  donation: PropTypes.object.isRequired,
  auth: PropTypes.object.isRequired
};

const mapStateToProps = (state) => ({
  request: state.request,
  donation: state.donation,
  auth: state.auth
});

export default connect(mapStateToProps, { getRequests, getDonations })(RecipientDashboard);