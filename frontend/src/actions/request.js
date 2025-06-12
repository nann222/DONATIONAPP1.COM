import axios from 'axios';
import { setAlert } from './alert';
import {
  GET_REQUESTS,
  GET_REQUEST,
  REQUEST_ERROR,
  CREATE_REQUEST
} from './types';

// Get requests
export const getRequests = () => async dispatch => {
  try {
    const res = await axios.get('/api/requests');
    dispatch({
      type: GET_REQUESTS,
      payload: res.data
    });
  } catch (err) {
    dispatch({
      type: REQUEST_ERROR,
      payload: { msg: err.response.statusText, status: err.response.status }
    });
  }
};

// Create request
export const submitNewRequest = (formData, history) => async dispatch => {
  try {
    const config = {
      headers: {
        'Content-Type': 'application/json'
      }
    };

    const res = await axios.post('/api/requests', formData, config);
    dispatch({
      type: CREATE_REQUEST,
      payload: res.data
    });
    dispatch(setAlert('Request created successfully', 'success'));
    history.push('/recipient/dashboard');
  } catch (err) {
    const errors = err.response.data.errors;
    if (errors) {
      errors.forEach(error => dispatch(setAlert(error.msg, 'error')));
    }
    dispatch({
      type: REQUEST_ERROR,
      payload: { msg: err.response.statusText, status: err.response.status }
    });
  }
};

// Get request by ID
export const getRequestById = (id) => async (dispatch) => {
  try {
    const res = await axios.get(`/api/requests/${id}`);
    dispatch({
      type: GET_REQUEST,
      payload: res.data
    });
  } catch (err) {
    dispatch({
      type: REQUEST_ERROR,
      payload: { msg: err.response.statusText, status: err.response.status }
    });
  }
};

// Create a new request
export const createRequest = (formData, history) => async (dispatch) => {
  const config = {
    headers: {
      'Content-Type': 'application/json'
    }
  };

  try {
    const res = await axios.post('/api/requests', formData, config);
    dispatch({
      type: CREATE_REQUEST,
      payload: res.data
    });
    dispatch(setAlert('Request Created', 'success'));
    // Optionally redirect after creation
    // history.push('/dashboard'); // Or wherever appropriate
  } catch (err) {
    const errors = err.response.data.errors;
    if (errors) {
      errors.forEach((error) => dispatch(setAlert(error.msg, 'danger')));
    }
    dispatch({
      type: REQUEST_ERROR,
      payload: { msg: err.response.statusText, status: err.response.status }
    });
  }
};