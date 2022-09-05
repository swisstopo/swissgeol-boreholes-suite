const initialState = {
  cnt: 0,
  selected: null,
  hover: null,
  maphover: null,
};

const home = (state = initialState, action) => {
  switch (action.type) {
    case "HOME_BOREHOLE_SELECTED": {
      return {
        ...state,
        selected: action.id,
        maphover: null,
        hover: null,
      };
    }
    case "HOME_BOREHOLE_HOVER": {
      return {
        ...state,
        hover: action.borehole,
      };
    }
    case "HOME_MAP_HOVER": {
      return {
        ...state,
        maphover: action.id,
      };
    }
    default:
      return state;
  }
};

export default home;
