import React, { Fragment } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { logout } from '../../actions/auth';
import { AppBar, Toolbar, Typography, Button, Box, IconButton, Menu, MenuItem } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu'; // For mobile menu
import AccountCircle from '@mui/icons-material/AccountCircle';

const Navbar = ({ auth: { isAuthenticated, loading, user }, logout }) => {
  const [anchorEl, setAnchorEl] = React.useState(null);
  const [mobileMoreAnchorEl, setMobileMoreAnchorEl] = React.useState(null);

  const isMenuOpen = Boolean(anchorEl);
  const isMobileMenuOpen = Boolean(mobileMoreAnchorEl);

  const handleProfileMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMobileMenuClose = () => {
    setMobileMoreAnchorEl(null);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    handleMobileMenuClose();
  };

  const handleLogout = () => {
    logout();
    handleMenuClose();
  };

  const handleMobileMenuOpen = (event) => {
    setMobileMoreAnchorEl(event.currentTarget);
  };

  const authLinks = (
    <Box sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center' }}>
      {user && user.role === 'donor' && (
        <Button color="inherit" component={RouterLink} to="/donation/new">New Donation</Button>
      )}
      {user && user.role === 'recipient' && (
        <Button color="inherit" component={RouterLink} to="/request/new">New Request</Button>
      )}
      <Button color="inherit" component={RouterLink} 
        to={`/${user ? user.role : ''}/dashboard`}>
          Dashboard
      </Button>
      <IconButton
        size="large"
        edge="end"
        aria-label="account of current user"
        aria-controls="primary-search-account-menu"
        aria-haspopup="true"
        onClick={handleProfileMenuOpen}
        color="inherit"
      >
        <AccountCircle />
      </IconButton>
    </Box>
  );

  const guestLinks = (
    <Box sx={{ display: { xs: 'none', md: 'flex' } }}>
      <Button color="inherit" component={RouterLink} to="/register">Register</Button>
      <Button color="inherit" component={RouterLink} to="/login">Login</Button>
    </Box>
  );
  
  const renderMenu = (
    <Menu
      anchorEl={anchorEl}
      anchorOrigin={{
        vertical: 'top',
        horizontal: 'right',
      }}
      id='primary-search-account-menu'
      keepMounted
      transformOrigin={{
        vertical: 'top',
        horizontal: 'right',
      }}
      open={isMenuOpen}
      onClose={handleMenuClose}
    >
      <MenuItem onClick={handleMenuClose} component={RouterLink} to="/profile">Profile</MenuItem> 
      {/* Add other relevant links here, e.g., My Account, Settings */}
      <MenuItem onClick={handleLogout}>Logout</MenuItem>
    </Menu>
  );

  // Basic mobile menu, can be expanded
  const mobileMenuId = 'primary-search-account-menu-mobile';
  const renderMobileMenu = (
    <Menu
      anchorEl={mobileMoreAnchorEl}
      anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      id={mobileMenuId}
      keepMounted
      transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      open={isMobileMenuOpen}
      onClose={handleMobileMenuClose}
    >
      {isAuthenticated ? (
        <Box>
          {user && user.role === 'donor' && (
             <MenuItem component={RouterLink} to="/donation/new" onClick={handleMobileMenuClose}>New Donation</MenuItem>
          )}
          {user && user.role === 'recipient' && (
             <MenuItem component={RouterLink} to="/request/new" onClick={handleMobileMenuClose}>New Request</MenuItem>
          )}
          <MenuItem component={RouterLink} to={`/${user ? user.role : ''}/dashboard`} onClick={handleMobileMenuClose}>Dashboard</MenuItem>
          <MenuItem onClick={handleProfileMenuOpen}>Profile</MenuItem>
        </Box>
      ) : (
        <Box>
          <MenuItem component={RouterLink} to="/register" onClick={handleMobileMenuClose}>Register</MenuItem>
          <MenuItem component={RouterLink} to="/login" onClick={handleMobileMenuClose}>Login</MenuItem>
        </Box>
      )}
    </Menu>
  );

  return (
    <AppBar position="static">
      <Toolbar>
        <Typography variant="h6" component={RouterLink} to="/" sx={{ flexGrow: 1, color: 'inherit', textDecoration: 'none' }}>
          Smart Donation
        </Typography>
        {!loading && (<Fragment>{isAuthenticated ? authLinks : guestLinks}</Fragment>)}
        <Box sx={{ display: { xs: 'flex', md: 'none' } }}>
            <IconButton
                size="large"
                aria-label="show more"
                aria-controls={mobileMenuId}
                aria-haspopup="true"
                onClick={handleMobileMenuOpen}
                color="inherit"
            >
                <MenuIcon />
            </IconButton>
        </Box>
      </Toolbar>
      {renderMenu}
      {renderMobileMenu}
    </AppBar>
  );
};

Navbar.propTypes = {
  logout: PropTypes.func.isRequired,
  auth: PropTypes.object.isRequired
};

const mapStateToProps = (state) => ({
  auth: state.auth
});

export default connect(mapStateToProps, { logout })(Navbar);