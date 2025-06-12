import {
  GET_MATCHES,
  APPROVE_MATCH,
  MATCHING_ERROR,
  AUTO_MATCH_COMPLETE
} from '../actions/types';

const initialState = {
  matches: [],
  loading: true,
  error: {},
  autoMatchResults: null
};

export default function(state = initialState, action) {
  const { type, payload } = action;

  switch (type) {
    case GET_MATCHES:
      return {
        ...state,
        matches: payload,
        loading: false
      };
    case APPROVE_MATCH:
      return {
        ...state,
        matches: state.matches.filter(match => match._id !== payload),
        loading: false
      };
    case AUTO_MATCH_COMPLETE:
      return {
        ...state,
        autoMatchResults: payload,
        loading: false
      };
    case MATCHING_ERROR:
      return {
        ...state,
        error: payload,
        loading: false
      };
    default:
      return state;
  }
}