const initialState = {
  index: 0,
};

const leftmenu = (state = initialState, action) => {
  switch (action.type) {
    case "LFMSELECTED":
      return {
        ...state,
        index: action.index,
      };

    default:
      return state;
  }
};

export default leftmenu;
