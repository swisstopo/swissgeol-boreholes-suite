const initialState = {
  error: null,
  isFetching: false,
  tab: 0,
  borehole: null,
};

const detail_borehole = (state = initialState, action) => {
  switch (action.type) {
    case "DETCNTTABCHG": {
      return {
        ...state,
        tab: action.tab,
      };
    }
    case "GETBOREHOLEDETAILS": {
      return {
        ...state,
        error: null,
        borehole: null,
        isFetching: true,
      };
    }
    case "GETBOREHOLEDETAILS_OK": {
      return {
        ...state,
        isFetching: false,
        borehole: action.borehole,
      };
    }
    case "GETBOREHOLEDETAILS_ERROR": {
      return {
        ...state,
        isFetching: false,
        error: action.error,
      };
    }
    default:
      return state;
  }
};

export default detail_borehole;
