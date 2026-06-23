import { applyMiddleware, combineReducers, compose, createStore } from "redux";
import { thunk } from "redux-thunk";

function user() {
  const initialState = {
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
        };
      }
      default: {
        return state;
      }
    }
  };
}

// Function that add dynamically reducers to the store
// Inspired by: https://stackoverflow.com/a/33044701
function createReducer(pluginsReducers) {
  const combinedReducers = combineReducers({
    core_user: user(),
    ...pluginsReducers,
  });
  return combinedReducers;
}

const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;

function configureStore() {
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
