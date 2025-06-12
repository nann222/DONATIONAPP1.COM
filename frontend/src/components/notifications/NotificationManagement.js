import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Container,
  Typography,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Button,
  Box,
  Chip,
  Alert,
  CircularProgress,
  Divider
} from '@mui/material';
import {
  Delete as DeleteIcon,
  MarkEmailRead as MarkReadIcon,
  Notifications as NotificationsIcon
} from '@mui/icons-material';
import {
  getNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  deleteNotification
} from '../../actions/notification';

const NotificationManagement = () => {
  const dispatch = useDispatch();
  const { notifications, loading } = useSelector(state => state.notification);
  const [localLoading, setLocalLoading] = useState(false);

  useEffect(() => {
    dispatch(getNotifications());
  }, [dispatch]);

  const handleMarkAsRead = async (id) => {
    setLocalLoading(true);
    await dispatch(markNotificationRead(id));
    setLocalLoading(false);
  };

  const handleMarkAllAsRead = async () => {
    setLocalLoading(true);
    await dispatch(markAllNotificationsRead());
    setLocalLoading(false);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this notification?')) {
      setLocalLoading(true);
      await dispatch(deleteNotification(id));
      setLocalLoading(false);
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress />
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Paper sx={{ p: 3 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h4" component="h1" gutterBottom>
            <NotificationsIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
            Notification Management
          </Typography>
          {unreadCount > 0 && (
            <Button
              variant="contained"
              color="primary"
              onClick={handleMarkAllAsRead}
              disabled={localLoading}
            >
              Mark All as Read ({unreadCount})
            </Button>
          )}
        </Box>

        {notifications.length === 0 ? (
          <Alert severity="info">
            No notifications found. You're all caught up!
          </Alert>
        ) : (
          <>
            <Typography variant="h6" gutterBottom>
              Total Notifications: {notifications.length}
              {unreadCount > 0 && (
                <Chip 
                  label={`${unreadCount} Unread`} 
                  color="primary" 
                  size="small" 
                  sx={{ ml: 2 }} 
                />
              )}
            </Typography>
            
            <List>
              {notifications.map((notification, index) => (
                <React.Fragment key={notification._id}>
                  <ListItem
                    sx={{
                      backgroundColor: notification.read ? 'transparent' : 'action.hover',
                      borderRadius: 1,
                      mb: 1
                    }}
                  >
                    <ListItemText
                      primary={
                        <Box display="flex" alignItems="center">
                          <Typography 
                            variant="subtitle1" 
                            sx={{ 
                              fontWeight: notification.read ? 'normal' : 'bold',
                              mr: 1
                            }}
                          >
                            {notification.title}
                          </Typography>
                          {!notification.read && (
                            <Chip label="New" color="primary" size="small" />
                          )}
                        </Box>
                      }
                      secondary={
                        <>
                          <Typography variant="body2" color="text.secondary">
                            {notification.message}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {new Date(notification.createdAt).toLocaleString()}
                          </Typography>
                        </>
                      }
                    />
                    <ListItemSecondaryAction>
                      <Box>
                        {!notification.read && (
                          <IconButton
                            edge="end"
                            aria-label="mark as read"
                            onClick={() => handleMarkAsRead(notification._id)}
                            disabled={localLoading}
                            sx={{ mr: 1 }}
                          >
                            <MarkReadIcon />
                          </IconButton>
                        )}
                        <IconButton
                          edge="end"
                          aria-label="delete"
                          onClick={() => handleDelete(notification._id)}
                          disabled={localLoading}
                          color="error"
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Box>
                    </ListItemSecondaryAction>
                  </ListItem>
                  {index < notifications.length - 1 && <Divider />}
                </React.Fragment>
              ))}
            </List>
          </>
        )}
      </Paper>
    </Container>
  );
};

export default NotificationManagement;