import {
  GET_LOGISTICS,
  GET_LOGISTICS_ITEM,
  LOGISTICS_ERROR,
  CREATE_LOGISTICS,
  UPDATE_LOGISTICS
} from '../actions/types';

const initialState = {
  logistics: [],
  logisticsItem: null,
  loading: true,
  error: {}
};

export default function(state = initialState, action) {
  const { type, payload } = action;

  switch (type) {
    case GET_LOGISTICS:
      return {
        ...state,
        logistics: payload,
        loading: false
      };
    case GET_LOGISTICS_ITEM:
      return {
        ...state,
        logisticsItem: payload,
        loading: false
      };
    case CREATE_LOGISTICS:
      return {
        ...state,
        logistics: [payload, ...state.logistics],
        loading: false
      };
    case UPDATE_LOGISTICS:
      return {
        ...state,
        logistics: state.logistics.map(item =>
          item._id === payload._id ? payload : item
        ),
        loading: false
      };
    case LOGISTICS_ERROR:
      return {
        ...state,
        error: payload,
        loading: false
      };
    default:
      return state;
  }
}