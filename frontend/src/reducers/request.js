import {
  GET_REQUESTS,
  GET_REQUEST,
  REQUEST_ERROR,
  CREATE_REQUEST
} from '../actions/types';

const initialState = {
  requests: [],
  request: null,
  loading: true,
  error: {}
};

export default function requestReducer(state = initialState, action) {
  const { type, payload } = action;

  switch (type) {
    case GET_REQUESTS:
      return {
        ...state,
        requests: payload,
        loading: false
      };
    case GET_REQUEST:
    case CREATE_REQUEST: // Assuming creating a request might return the created request
      return {
        ...state,
        request: payload,
        loading: false
      };
    case REQUEST_ERROR:
      return {
        ...state,
        error: payload,
        loading: false
      };
    default:
      return state;
  }
}