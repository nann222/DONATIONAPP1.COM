import {
  GET_DONATIONS,
  GET_DONATION,
  DONATION_ERROR,
  CREATE_DONATION
} from '../actions/types';

const initialState = {
  donations: [],
  donation: null,
  loading: true,
  error: {}
};

export default function donationReducer(state = initialState, action) {
  const { type, payload } = action;

  switch (type) {
    case GET_DONATIONS:
      return {
        ...state,
        donations: payload,
        loading: false
      };
    case GET_DONATION:
    case CREATE_DONATION: // Assuming creating a donation might return the created donation
      return {
        ...state,
        donation: payload,
        loading: false
      };
    case DONATION_ERROR:
      return {
        ...state,
        error: payload,
        loading: false
      };
    default:
      return state;
  }
}