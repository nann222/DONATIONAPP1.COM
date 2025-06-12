import { combineReducers } from 'redux';
import auth from './auth';
import alert from './alert';
import donation from './donation';
import request from './request';
import feedback from './feedback';
import notification from './notification';
import logistics from './logistics';
import matching from './matching';

export default combineReducers({
  auth,
  alert,
  donation,
  request,
  feedback,
  notification,
  logistics,
  matching
});