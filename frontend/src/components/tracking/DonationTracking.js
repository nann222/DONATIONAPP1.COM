import React, { useEffect } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { getDonationById } from '../../actions/donation';
import { Typography, Container, Paper, CircularProgress, Box, List, ListItem, ListItemText, Divider } from '@mui/material';

const DonationTracking = ({ getDonationById, donation: { donation, loading, error }, match }) => {
  useEffect(() => {
    if (match.params.id) {
      getDonationById(match.params.id);
    }
  }, [getDonationById, match.params.id]);

  if (loading || donation === null) {
    return (
      <Container sx={{ display: 'flex', justifyContent: 'center', mt: 5 }}>
        <CircularProgress />
      </Container>
    );
  }

  if (error && Object.keys(error).length > 0) {
    return (
      <Container component={Paper} sx={{ mt: 4, p: 3, textAlign: 'center' }}>
        <Typography variant="h6" color="error">
          Error loading donation details: {error.msg || 'Unknown error'}
        </Typography>
      </Container>
    );
  }

  return (
    <Container component={Paper} sx={{ mt: 4, p: 3 }}>
      <Typography variant="h5" gutterBottom>
        Donation Tracking Details (ID: {donation.trackingId})
      </Typography>
      <Box sx={{ my: 2 }}>
        <Typography variant="h6">Status: {donation.status}</Typography>
        <Typography variant="subtitle1">Donation Date: {new Date(donation.donationDate).toLocaleDateString()}</Typography>
        {donation.description && <Typography variant="body1">Description: {donation.description}</Typography>}
      </Box>
      
      <Divider sx={{ my: 2 }} />

      <Typography variant="h6" gutterBottom>Items Donated:</Typography>
      {donation.items && donation.items.length > 0 ? (
        <List>
          {donation.items.map((item) => (
            <ListItem key={item._id} disablePadding>
              <ListItemText 
                primary={`${item.itemName} (${item.itemType})`}
                secondary={`Quantity: ${item.quantity}${item.expiryDate ? ', Expires: ' + new Date(item.expiryDate).toLocaleDateString() : ''}`}
              />
            </ListItem>
          ))}
        </List>
      ) : (
        <Typography>No items listed for this donation.</Typography>
      )}

      {donation.donor && (
        <>
          <Divider sx={{ my: 2 }} />
          <Typography variant="h6" gutterBottom>Donor Information:</Typography>
          <Typography>Name: {donation.donor.name}</Typography>
          <Typography>Email: {donation.donor.email}</Typography>
          {/* Add more donor details as needed */}
        </>
      )}

      {donation.recipient && (
        <>
          <Divider sx={{ my: 2 }} />
          <Typography variant="h6" gutterBottom>Recipient Information:</Typography>
          <Typography>Name: {donation.recipient.name}</Typography>
          <Typography>Email: {donation.recipient.email}</Typography>
          {/* Add more recipient details as needed */}
        </>
      )}

      {donation.logistics && (
        <>
          <Divider sx={{ my: 2 }} />
          <Typography variant="h6" gutterBottom>Logistics Information:</Typography>
          <Typography>Status: {donation.logistics.status}</Typography>
          <Typography>Provider: {donation.logistics.provider || 'N/A'}</Typography>
          <Typography>Notes: {donation.logistics.notes || 'N/A'}</Typography>
          {/* Add more logistics details as needed */}
        </>
      )}
    </Container>
  );
};

DonationTracking.propTypes = {
  getDonationById: PropTypes.func.isRequired,
  donation: PropTypes.object.isRequired,
  match: PropTypes.object.isRequired
};

const mapStateToProps = (state) => ({
  donation: state.donation
});

export default connect(mapStateToProps, { getDonationById })(DonationTracking);