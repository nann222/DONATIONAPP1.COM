import axios from 'axios';
import { setAlert } from './alert';
import {
  GET_NOTIFICATIONS,
  GET_NOTIFICATION,
  NOTIFICATION_ERROR,
  CREATE_NOTIFICATION,
  MARK_NOTIFICATION_READ,
  MARK_ALL_NOTIFICATIONS_READ,
  DELETE_NOTIFICATION,
  GET_NOTIFICATION_COUNT
} from './types';

// Get all notifications for current user
export const getNotifications = () => async (dispatch) => {
  try {
    const res = await axios.get('/api/notifications');
    dispatch({
      type: GET_NOTIFICATIONS,
      payload: res.data
    });
  } catch (err) {
    dispatch({
      type: NOTIFICATION_ERROR,
      payload: { msg: err.response?.statusText, status: err.response?.status }
    });
  }
};

// Get unread notification count
export const getNotificationCount = () => async (dispatch) => {
  try {
    const res = await axios.get('/api/notifications/count');
    dispatch({
      type: GET_NOTIFICATION_COUNT,
      payload: res.data.count
    });
  } catch (err) {
    dispatch({
      type: NOTIFICATION_ERROR,
      payload: { msg: err.response?.statusText, status: err.response?.status }
    });
  }
};

// Mark notification as read
export const markNotificationRead = (id) => async (dispatch) => {
  try {
    const res = await axios.put(`/api/notifications/${id}/read`);
    dispatch({
      type: MARK_NOTIFICATION_READ,
      payload: res.data
    });
  } catch (err) {
    dispatch({
      type: NOTIFICATION_ERROR,
      payload: { msg: err.response?.statusText, status: err.response?.status }
    });
  }
};

// Mark all notifications as read
export const markAllNotificationsRead = () => async (dispatch) => {
  try {
    await axios.put('/api/notifications/read-all');
    dispatch({
      type: MARK_ALL_NOTIFICATIONS_READ
    });
    dispatch(setAlert('All notifications marked as read', 'success'));
  } catch (err) {
    dispatch({
      type: NOTIFICATION_ERROR,
      payload: { msg: err.response?.statusText, status: err.response?.status }
    });
    dispatch(setAlert('Error marking notifications as read', 'error'));
  }
};

// Delete notification
export const deleteNotification = (id) => async (dispatch) => {
  try {
    await axios.delete(`/api/notifications/${id}`);
    dispatch({
      type: DELETE_NOTIFICATION,
      payload: id
    });
    dispatch(setAlert('Notification deleted', 'success'));
  } catch (err) {
    dispatch({
      type: NOTIFICATION_ERROR,
      payload: { msg: err.response?.statusText, status: err.response?.status }
    });
    dispatch(setAlert('Error deleting notification', 'error'));
  }
};

// Create notification (admin only)
export const createNotification = (notificationData) => async (dispatch) => {
  const config = {
    headers: {
      'Content-Type': 'application/json'
    }
  };

  try {
    const res = await axios.post('/api/notifications', notificationData, config);
    dispatch({
      type: CREATE_NOTIFICATION,
      payload: res.data
    });
    dispatch(setAlert('Notification created successfully', 'success'));
  } catch (err) {
    dispatch({
      type: NOTIFICATION_ERROR,
      payload: { msg: err.response?.statusText, status: err.response?.status }
    });
    dispatch(setAlert('Error creating notification', 'error'));
  }
};