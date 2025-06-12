import axios from 'axios';
import { setAlert } from './alert';
import {
  GET_DONATIONS,
  GET_DONATION,
  DONATION_ERROR,
  CREATE_DONATION
} from './types';

// Get donations
export const getDonations = () => async dispatch => {
  try {
    const res = await axios.get('/api/donations');
    dispatch({
      type: GET_DONATIONS,
      payload: res.data
    });
  } catch (err) {
    dispatch({
      type: DONATION_ERROR,
      payload: { msg: err.response.statusText, status: err.response.status }
    });
  }
};

// Create donation
export const createNewDonation = (formData, history) => async dispatch => {
  try {
    const config = {
      headers: {
        'Content-Type': 'application/json'
      }
    };

    const res = await axios.post('/api/donations', formData, config);
    dispatch({
      type: CREATE_DONATION,
      payload: res.data
    });
    dispatch(setAlert('Donation created successfully', 'success'));
    history.push('/donor/dashboard');
  } catch (err) {
    const errors = err.response.data.errors;
    if (errors) {
      errors.forEach(error => dispatch(setAlert(error.msg, 'error')));
    }
    dispatch({
      type: DONATION_ERROR,
      payload: { msg: err.response.statusText, status: err.response.status }
    });
  }
};

// Get donation by ID
export const getDonationById = (id) => async (dispatch) => {
  try {
    const res = await axios.get(`/api/donations/${id}`);
    dispatch({
      type: GET_DONATION,
      payload: res.data
    });
  } catch (err) {
    dispatch({
      type: DONATION_ERROR,
      payload: { msg: err.response.statusText, status: err.response.status }
    });
  }
};

// Create a new donation
export const createDonation = (formData, history) => async (dispatch) => {
  const config = {
    headers: {
      'Content-Type': 'application/json'
    }
  };

  try {
    const res = await axios.post('/api/donations', formData, config);
    dispatch({
      type: CREATE_DONATION,
      payload: res.data
    });
    dispatch(setAlert('Donation Created', 'success'));
    // Optionally redirect after creation
    // history.push('/dashboard'); // Or wherever appropriate
  } catch (err) {
    const errors = err.response.data.errors;
    if (errors) {
      errors.forEach((error) => dispatch(setAlert(error.msg, 'danger')));
    }
    dispatch({
      type: DONATION_ERROR,
      payload: { msg: err.response.statusText, status: err.response.status }
    });
  }
};