import React, { useState } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { createRequest } from '../../actions/request';
import { TextField, Button, Typography, Container, Grid, Paper, Select, MenuItem, InputLabel, FormControl } from '@mui/material';

const RequestForm = ({ createRequest, history }) => {
  const [formData, setFormData] = useState({
    itemType: 'Food',
    quantity: '',
    urgency: 'medium', // Changed to lowercase
    description: ''
  });

  const { itemType, quantity, urgency, description } = formData;

  const onChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const onSubmit = (e) => {
    e.preventDefault();
    if (!itemType || !quantity) {
      alert('Item type and quantity are required');
      return;
    }
    
    const quantityNum = parseInt(quantity);
    if (isNaN(quantityNum) || quantityNum <= 0) {
      alert('Quantity must be a valid positive number');
      return;
    }
    
    const requestData = {
      ...formData,
      quantity: quantityNum
    };
    
    createRequest(requestData, history);
  };

  return (
    <Container component={Paper} sx={{ mt: 4, p: 3 }}>
      <Typography variant="h5" gutterBottom>
        Create New Request
      </Typography>
      <form onSubmit={onSubmit}>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth required variant="outlined">
              <InputLabel id="itemType-label">Item Type</InputLabel>
              <Select
                labelId="itemType-label"
                name="itemType"
                value={itemType}
                onChange={onChange}
                label="Item Type"
              >
                <MenuItem value="Food">Food</MenuItem>
                <MenuItem value="Clothing">Clothing</MenuItem>
                <MenuItem value="Electronics">Electronics</MenuItem>
                <MenuItem value="Furniture">Furniture</MenuItem>
                <MenuItem value="School Supplies">School Supplies</MenuItem>
                <MenuItem value="Medical Supplies">Medical Supplies</MenuItem>
                <MenuItem value="Other">Other</MenuItem>
              </Select>
            </FormControl>
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
            <FormControl fullWidth required variant="outlined">
              <InputLabel id="urgency-label">Urgency</InputLabel>
              <Select
                labelId="urgency-label"
                name="urgency"
                value={urgency}
                onChange={onChange}
                label="Urgency"
              >
                <MenuItem value="low">Low</MenuItem>
                <MenuItem value="medium">Medium</MenuItem>
                <MenuItem value="high">High</MenuItem>
                <MenuItem value="critical">Critical</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12}>
            <TextField
              name="description"
              variant="outlined"
              required
              fullWidth
              multiline
              rows={4}
              label="Request Description"
              value={description}
              onChange={onChange}
            />
          </Grid>
          <Grid item xs={12}>
            <Button type="submit" fullWidth variant="contained" color="primary">
              Submit Request
            </Button>
          </Grid>
        </Grid>
      </form>
    </Container>
  );
};

RequestForm.propTypes = {
  createRequest: PropTypes.func.isRequired,
  history: PropTypes.object.isRequired // If using react-router for navigation
};

export default connect(null, { createRequest })(RequestForm);