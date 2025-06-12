import {
  GET_FEEDBACKS,
  GET_FEEDBACK,
  FEEDBACK_ERROR,
  CREATE_FEEDBACK
} from '../actions/types';

const initialState = {
  feedbacks: [],
  feedback: null,
  loading: true,
  error: {}
};

export default function feedbackReducer(state = initialState, action) {
  const { type, payload } = action;

  switch (type) {
    case GET_FEEDBACKS:
      return {
        ...state,
        feedbacks: payload,
        loading: false
      };
    case GET_FEEDBACK:
    case CREATE_FEEDBACK: // Assuming creating feedback might return the created feedback
      return {
        ...state,
        feedback: payload,
        loading: false
      };
    case FEEDBACK_ERROR:
      return {
        ...state,
        error: payload,
        loading: false
      };
    default:
      return state;
  }
}