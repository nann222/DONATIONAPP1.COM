import React, { useState } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { createDonation } from '../../actions/donation';
import { TextField, Button, Typography, Container, Grid, Paper } from '@mui/material';

const DonationForm = ({ createDonation, history }) => {
  const [formData, setFormData] = useState({
    itemName: '',
    itemType: 'Food',
    quantity: '',
    expiryDate: '',
    description: '',
  });

  const { itemName, itemType, quantity, expiryDate, description } = formData;

  const onChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const onSubmit = (e) => {
    e.preventDefault();
    if (!itemName || !quantity) {
      alert('Item name and quantity are required');
      return;
    }
    
    const quantityNum = parseInt(quantity);
    if (isNaN(quantityNum) || quantityNum <= 0) {
      alert('Quantity must be a valid positive number');
      return;
    }
    
    const donationData = {
      items: [{ 
        itemName, 
        itemType, 
        quantity: quantityNum,
        expiryDate, 
        description 
      }],
      description: `Donation of ${itemName}`
    };
    createDonation(donationData, history);
  };

  return (
    <Container component={Paper} sx={{ mt: 4, p: 3 }}>
      <Typography variant="h5" gutterBottom>
        Create New Donation
      </Typography>
      <form onSubmit={onSubmit}>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <TextField
              name="itemName"
              variant="outlined"
              required
              fullWidth
              label="Item Name"
              value={itemName}
              onChange={onChange}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              name="itemType"
              variant="outlined"
              required
              fullWidth
              label="Item Type (e.g., Food, Clothing)"
              value={itemType}
              onChange={onChange}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              name="quantity"
              variant="outlined"
              required
              fullWidth
              type="number"
              label="Quantity"
              value={quantity}
              onChange={onChange}
              inputProps={{ min: 1 }}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              name="expiryDate"
              variant="outlined"
              fullWidth
              label="Expiry Date (Optional)"
              type="date"
              InputLabelProps={{
                shrink: true,
              }}
              value={expiryDate}
              onChange={onChange}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              name="description"
              variant="outlined"
              fullWidth
              multiline
              rows={4}
              label="Item Description (Optional)"
              value={description}
              onChange={onChange}
            />
          </Grid>
          <Grid item xs={12}>
            <Button type="submit" fullWidth variant="contained" color="primary">
              Submit Donation
            </Button>
          </Grid>
        </Grid>
      </form>
    </Container>
  );
};

DonationForm.propTypes = {
  createDonation: PropTypes.func.isRequired,
  history: PropTypes.object.isRequired // If using react-router for navigation
};

// Pass null if not mapping state to props
export default connect(null, { createDonation })(DonationForm);