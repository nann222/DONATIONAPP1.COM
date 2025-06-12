import {
  GET_NOTIFICATIONS,
  GET_NOTIFICATION,
  NOTIFICATION_ERROR,
  CREATE_NOTIFICATION,
  MARK_NOTIFICATION_READ,
  MARK_ALL_NOTIFICATIONS_READ,
  DELETE_NOTIFICATION,
  GET_NOTIFICATION_COUNT
} from '../actions/types';

const initialState = {
  notifications: [],
  notification: null,
  loading: true,
  error: {},
  unreadCount: 0
};

export default function(state = initialState, action) {
  const { type, payload } = action;

  switch (type) {
    case GET_NOTIFICATIONS:
      return {
        ...state,
        notifications: payload,
        loading: false
      };
    case GET_NOTIFICATION:
      return {
        ...state,
        notification: payload,
        loading: false
      };
    case CREATE_NOTIFICATION:
      return {
        ...state,
        notifications: [payload, ...state.notifications],
        loading: false
      };
    case MARK_NOTIFICATION_READ:
      return {
        ...state,
        notifications: state.notifications.map(notification =>
          notification._id === payload ? { ...notification, read: true } : notification
        ),
        unreadCount: Math.max(0, state.unreadCount - 1)
      };
    case MARK_ALL_NOTIFICATIONS_READ:
      return {
        ...state,
        notifications: state.notifications.map(notification => ({ ...notification, read: true })),
        unreadCount: 0
      };
    case DELETE_NOTIFICATION:
      return {
        ...state,
        notifications: state.notifications.filter(notification => notification._id !== payload)
      };
    case GET_NOTIFICATION_COUNT:
      return {
        ...state,
        unreadCount: payload
      };
    case NOTIFICATION_ERROR:
      return {
        ...state,
        error: payload,
        loading: false
      };
    default:
      return state;
  }
}