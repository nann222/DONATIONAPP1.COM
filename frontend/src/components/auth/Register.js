import React, { useState } from 'react';
import { connect } from 'react-redux';
import { Link, Navigate } from 'react-router-dom';
import { setAlert } from '../../actions/alert';
import { register } from '../../actions/auth';
import PropTypes from 'prop-types';
import { TextField, Button, Typography, Container, Grid, Paper, Select, MenuItem, InputLabel, FormControl } from '@mui/material';

const Register = ({ setAlert, register, isAuthenticated, user }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    password2: '',
    role: 'donor', // Default role
    phone: '',
    address: '',
    organization: ''
  });

  const { name, email, password, password2, role, phone, address, organization } = formData;

  const onChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!name.trim()) {
      setAlert('Name is required', 'error');
      return;
    }
    if (!email.trim()) {
      setAlert('Email is required', 'error');
      return;
    }
    if (!password) {
      setAlert('Password is required', 'error');
      return;
    }
    if (password.length < 6) {
      setAlert('Password must be at least 6 characters', 'error');
      return;
    }
    if (password !== password2) {
      setAlert('Passwords do not match', 'error');
      return;
    }
    if (!role) {
      setAlert('Please select your role', 'error');
      return;
    }
    
    register({ name, email, password, role, phone, address, organization });
  };

  if (isAuthenticated && user) {
    // Redirect based on user's actual role after registration
    if (user.role === 'admin') {
      return <Navigate to="/admin/dashboard" replace />;
    } else if (user.role === 'donor') {
      return <Navigate to="/donor/dashboard" replace />;
    } else if (user.role === 'recipient') {
      return <Navigate to="/recipient/dashboard" replace />;
    }
    return <Navigate to="/login" replace />;
  }

  return (
    <Container component={Paper} sx={{ mt: 4, p: 3, maxWidth: '600px' }}>
      <Typography variant="h4" gutterBottom align="center">
        Sign Up
      </Typography>
      <Typography variant="subtitle1" align="center" gutterBottom>
        Create Your Account
      </Typography>
      <form onSubmit={onSubmit}>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <TextField
              name="name"
              variant="outlined"
              required
              fullWidth
              label="Full Name"
              value={name}
              onChange={onChange}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              name="email"
              variant="outlined"
              required
              fullWidth
              label="Email Address"
              type="email"
              value={email}
              onChange={onChange}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              name="password"
              variant="outlined"
              required
              fullWidth
              label="Password"
              type="password"
              value={password}
              onChange={onChange}
              inputProps={{ minLength: 6 }}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              name="password2"
              variant="outlined"
              required
              fullWidth
              label="Confirm Password"
              type="password"
              value={password2}
              onChange={onChange}
              inputProps={{ minLength: 6 }}
            />
          </Grid>
          <Grid item xs={12}>
            <FormControl fullWidth required variant="outlined">
              <InputLabel id="role-label">I am a...</InputLabel>
              <Select
                labelId="role-label"
                name="role"
                value={role}
                onChange={onChange}
                label="I am a..."
              >
                <MenuItem value="donor">Donor</MenuItem>
                <MenuItem value="recipient">Recipient</MenuItem>
                <MenuItem value="admin">Admin</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              name="phone"
              variant="outlined"
              fullWidth
              label="Phone Number (Optional)"
              value={phone}
              onChange={onChange}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              name="organization"
              variant="outlined"
              fullWidth
              label="Organization (Optional)"
              value={organization}
              onChange={onChange}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              name="address"
              variant="outlined"
              fullWidth
              label="Address (Optional)"
              multiline
              rows={2}
              value={address}
              onChange={onChange}
            />
          </Grid>
          <Grid item xs={12}>
            <Button type="submit" fullWidth variant="contained" color="primary" sx={{ mt: 2 }}>
              Register
            </Button>
          </Grid>
          <Grid item xs={12} sx={{ textAlign: 'center', mt: 1 }}>
            <Typography variant="body2">
              Already have an account? <Link to="/login">Sign In</Link>
            </Typography>
          </Grid>
        </Grid>
      </form>
    </Container>
  );
};

Register.propTypes = {
  setAlert: PropTypes.func.isRequired,
  register: PropTypes.func.isRequired,
  isAuthenticated: PropTypes.bool,
  user: PropTypes.object
};

const mapStateToProps = (state) => ({
  isAuthenticated: state.auth.isAuthenticated,
  user: state.auth.user
});

export default connect(mapStateToProps, { setAlert, register })(Register);