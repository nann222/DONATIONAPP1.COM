import axios from 'axios';
import { setAlert } from './alert';
import {
  GET_FEEDBACKS,
  GET_FEEDBACK,
  FEEDBACK_ERROR,
  CREATE_FEEDBACK
} from './types';

// Get all feedbacks
export const getFeedbacks = () => async (dispatch) => {
  try {
    const res = await axios.get('/api/feedbacks');
    dispatch({
      type: GET_FEEDBACKS,
      payload: res.data
    });
  } catch (err) {
    dispatch({
      type: FEEDBACK_ERROR,
      payload: { msg: err.response.statusText, status: err.response.status }
    });
  }
};

// Get feedback by ID
export const getFeedbackById = (id) => async (dispatch) => {
  try {
    const res = await axios.get(`/api/feedbacks/${id}`);
    dispatch({
      type: GET_FEEDBACK,
      payload: res.data
    });
  } catch (err) {
    dispatch({
      type: FEEDBACK_ERROR,
      payload: { msg: err.response.statusText, status: err.response.status }
    });
  }
};

// Create new feedback
export const createFeedback = (formData, history) => async (dispatch) => {
  const config = {
    headers: {
      'Content-Type': 'application/json'
    }
  };

  try {
    const res = await axios.post('/api/feedbacks', formData, config);
    dispatch({
      type: CREATE_FEEDBACK,
      payload: res.data
    });
    dispatch(setAlert('Feedback Submitted', 'success'));
    // Optionally redirect
    // history.push('/dashboard');
  } catch (err) {
    const errors = err.response.data.errors;
    if (errors) {
      errors.forEach((error) => dispatch(setAlert(error.msg, 'danger')));
    }
    dispatch({
      type: FEEDBACK_ERROR,
      payload: { msg: err.response.statusText, status: err.response.status }
    });
  }
};