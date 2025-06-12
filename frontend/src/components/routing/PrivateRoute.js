import React from 'react';
import { Route, Redirect } from 'react-router-dom';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { CircularProgress, Container } from '@mui/material';

const PrivateRoute = ({
  component: Component,
  auth: { isAuthenticated, loading, user }, // Add user here
  allowedRoles, // New prop for role-based access
  ...rest
}) => (
  <Route
    {...rest}
    render={(props) => {
      if (loading) {
        return (
          <Container sx={{ display: 'flex', justifyContent: 'center', mt: 5 }}>
            <CircularProgress />
          </Container>
        );
      }
      if (!isAuthenticated) {
        return <Redirect to="/" />;
      }
      // Check for role-based access if allowedRoles is provided
      if (allowedRoles && user && !allowedRoles.includes(user.role)) {
        // Redirect to a 'not authorized' page or home/dashboard
        // For simplicity, redirecting to home/dashboard based on role
        const homePath = user.role ? `/${user.role}/dashboard` : '/';
        return <Redirect to={homePath} />;
      }
      return <Component {...props} />;
    }}
  />
);

PrivateRoute.propTypes = {
  component: PropTypes.elementType.isRequired,
  auth: PropTypes.object.isRequired,
  allowedRoles: PropTypes.arrayOf(PropTypes.string) // Optional: for role-based access
};

const mapStateToProps = (state) => ({
  auth: state.auth
});

export default connect(mapStateToProps)(PrivateRoute);