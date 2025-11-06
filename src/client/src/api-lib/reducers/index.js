import { applyMiddleware, combineReducers, compose, createStore } from "redux";
import { thunk } from "redux-thunk";

export function user() {
  const initialState = {
    isFetching: false,
    error: false,
    fetchCount: 0,
    fetchTime: 0,
    data: null,
    authentication: null,
  };
  return function _user(state = initialState, action) {
    const { path } = action;
    if (path !== "/user") {
      return state;
    }
    switch (action.type) {
      case "SET_AUTHENTICATION": {
        return {
          ...state,
          authentication: action.user,
        };
      }
      case "UNSET_AUTHENTICATION": {
        return {
          ...initialState,
          data: null,
        };
      }
      case "GET": {
        return {
          ...initialState,
          authentication: {
            ...state.authentication,
          },
          error: false,
          fetchTime: new Date().getTime(),
          isFetching: true,
        };
      }
      case "GET_OK": {
        let copy = {
          ...state,
          fetchCount: state.fetchCount + 1,
          isFetching: false,
          error: false,
          fetchTime: new Date().getTime() - state.fetchTime,
          data: action.json.data,
        };
        return copy;
      }
      case "GET_ERROR": {
        let copy = {
          ...state,
          fetchCount: state.fetchCount + 1,
          isFetching: false,
          error: true,
          fetchTime: new Date().getTime() - state.fetchTime,
        };
        return copy;
      }
      case "GET_CONNECTION_ERROR": {
        let copy = {
          ...state,
          error: action.error.response.status === 401 ? true : state.error,
          fetchCount: state.fetchCount + 1,
          isFetching: false,
          fetchTime: new Date().getTime() - state.fetchTime,
        };
        return copy;
      }
      case "RELOAD_OK": {
        let copy = {
          ...state,
          data: action.json.data,
        };
        return copy;
      }
      default: {
        return state;
      }
    }
  };
}

export function boreholeEditorList() {
  const initialState = {
    isFetching: false,
    fetchTime: 0,
    fetchCount: 0,
    length: 0,
    data: [],
    direction: null,
    orderby: null,
    page: 1,
    pages: 0,
  };
  return function boreholesEditor(state = initialState, action) {
    const { path } = action;
    if (path !== "/borehole/edit") {
      return state;
    }
    switch (action.type) {
      case "LIST": {
        return {
          ...initialState,
          fetchTime: new Date().getTime(),
          page: state.page,
          pages: state.pages,
          direction: state.direction,
          orderby: state.orderby,
          isFetching: true,
        };
      }
      case "LIST_OK": {
        let copy = {
          ...state,
          fetchCount: state.fetchCount + 1,
          length: action.json.rows,
          isFetching: false,
          fetchTime: new Date().getTime() - state.fetchTime,
          data: action.json.data,
          filtered_borehole_ids: action.json.filtered_borehole_ids,
          // eslint-disable-next-line no-prototype-builtins
          pages: action.json.hasOwnProperty("pages") ? action.json.pages : null,
          page: Object.prototype.hasOwnProperty.call(action.json, "page") ? action.json.page : null,
          direction: Object.prototype.hasOwnProperty.call(action.json, "direction") ? action.json.direction : null,
          orderby: Object.prototype.hasOwnProperty.call(action.json, "orderby") ? action.json.orderby : null,
        };
        return copy;
      }
      default: {
        return state;
      }
    }
  };
}

// Function that add dynamically reducers to the store
// Inspired by: https://stackoverflow.com/a/33044701
export function createReducer(pluginsReducers) {
  const combinedReducers = combineReducers({
    core_user: user(),
    core_borehole_editor_list: boreholeEditorList(),
    ...pluginsReducers,
  });
  return combinedReducers;
}

const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;

export function configureStore() {
  const store = createStore(createReducer(), composeEnhancers(applyMiddleware(thunk)));
  store.pluginsReducers = {};
  return store;
}

export function injectReducer(store, reducer) {
  store.pluginsReducers = {
    ...store.pluginsReducers,
    ...reducer,
  };
  store.replaceReducer(createReducer(store.pluginsReducers));
}

const store = configureStore();
export default store;
