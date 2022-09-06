const initialState = {
  locking: false,
  lockable: true,
  pselected: null,
  bselected: null,
  mselected: null,
};

const editor = (state = initialState, action) => {
  switch (action.type) {
    case "EDITOR_BOREHOLE_LOCKING": {
      return {
        ...state,
        locking: true,
      };
    }
    case "EDITOR_BOREHOLE_LOCKING_ERROR": {
      return {
        ...state,
        locking: false,
        lockable: false,
      };
    }
    case "EDITOR_PROJECT_SELECTED": {
      return {
        ...state,
        pselected: action.selected,
      };
    }
    case "EDITOR_BOREHOLE_SELECTED": {
      return {
        ...state,
        bselected: action.selected,
      };
    }
    case "EDITOR_MULTIPLE_SELECTED": {
      return {
        ...state,
        mselected: action.selection,
      };
    }
    default:
      return state;
  }
};

export default editor;
