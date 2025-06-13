import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { CircularProgress, Container } from '@mui/material';

const PrivateRoute = ({
  children,
  auth: { isAuthenticated, loading, user },
  allowedRoles,
}) => {
  const location = useLocation();

  if (loading) {
    return (
      <Container sx={{ display: 'flex', justifyContent: 'center', mt: 5 }}>
        <CircularProgress />
      </Container>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  // Check for role-based access if allowedRoles is provided
  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    // Redirect to a 'not authorized' page or home/dashboard
    const homePath = user.role ? `/${user.role}/dashboard` : '/';
    return <Navigate to={homePath} state={{ from: location }} replace />;
  }

  return children;
};

PrivateRoute.propTypes = {
  children: PropTypes.node.isRequired,
  auth: PropTypes.object.isRequired,
  allowedRoles: PropTypes.arrayOf(PropTypes.string)
};

const mapStateToProps = (state) => ({
  auth: state.auth
});

export default connect(mapStateToProps)(PrivateRoute);