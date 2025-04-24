const initialState = {
  isFetching: false,
  isReady: false,
  coreUser: false,
  terms: false,
};

const dataLoaderState = (state = initialState, action) => {
  const { path } = action;
  if (path !== "/user" && path !== "/terms") {
    return state;
  }
  let copy = {
    ...state,
  };
  if (path === "/terms") {
    switch (action.type) {
      case "ACCEPT_OK":
        copy.terms = action.json.success;
        break;

      default:
        return state;
    }
  } else if (path === "/user") {
    switch (action.type) {
      case "GET_OK":
        copy.coreUser = true;
        copy.terms = action.json.data.terms;
        break;

      case "UNSET_AUTHENTICATION":
        copy.coreUser = false;
        copy.isReady = false;
        copy.terms = false;
        break;

      default:
        return state;
    }
  }
  if (copy.coreUser) {
    copy.isReady = true;
  }

  return copy;
};

export default dataLoaderState;
