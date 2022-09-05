const initialState = {
  isFetching: false,
  data: null,
};

const wmts = (state = initialState, action) => {
  switch (action.type) {
    case "WMTS_GETCAPABILITIES": {
      return {
        ...state,
        isFetching: true,
      };
    }
    case "WMTS_GETCAPABILITIES_OK": {
      return {
        ...state,
        isFetching: false,
        data: {
          swisstopo: {
            name: "swisstopo",
            wmts: action.data,
          },
        },
      };
    }
    default:
      return state;
  }
};

export default wmts;
