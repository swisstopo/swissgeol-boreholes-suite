const initialState = {
  error: null,
  isFetching: false,
  isFetchingStratigraphies: false,
  tab: 0,
  borehole: null,
  stratigraphies: []
};

const detail_borehole = (state = initialState, action) => {
  switch (action.type) {
    case 'DETCNTTABCHG': {
      return {
        ...state,
        tab: action.tab
      };
    }
    case 'GETBOREHOLEDETAILS': {
      return {
        ...state,
        error: null,
        borehole: null,
        stratigraphies: [],
        isFetching: true
      };
    }
    case 'GETBOREHOLEDETAILS_OK': {
      return {
        ...state,
        isFetching: false,
        borehole: action.borehole
      };
    }
    case 'GETBOREHOLEDETAILS_ERROR': {
      return {
        ...state,
        isFetching: false,
        error: action.error
      };
    }
    case 'GET_BOREHOLE_STRATIGRAPHIES': {
      return {
        ...state,
        stratigraphies: [],
        isFetchingStratigraphies: true
      };
    }
    case 'GET_BOREHOLE_STRATIGRAPHIES_OK': {
      return {
        ...state,
        isFetchingStratigraphies: false,
        stratigraphies: action.stratigraphies
      };
    }
    default:
      return state;
  }
};

export default detail_borehole;
