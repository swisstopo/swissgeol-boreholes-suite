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

export function borehole() {
  const initialState = {
    isFetching: false,
    isLocking: false,
    fetchCount: 0,
    fetchTime: 0,
    error: null,
    ...{
      data: {
        id: null,
        visible: false,
        lock: null,
        borehole_type: null,
        restriction: null,
        restriction_until: null,
        national_interest: null,
        location_x: "",
        location_y: "",
        spatial_reference_system: null,
        location_precision: null,
        elevation_z: "",
        height_reference_system: null,
        elevation_precision: null,
        drilling_date: null,
        length: null,
        ...{
          extended: {
            original_name: "",
            method: null,
            purpose: null,
            status: null,
            top_bedrock_fresh_md: null,
            groundwater: null,
          },
        },
        ...{
          custom: {
            identifiers: null,
            public_name: "",
            project_name: "",
            country: null,
            canton: null,
            municipality: null,
            address: "",
            landuse: null,
            cuttings: null,
            drill_diameter: "",
            qt_depth: null,
            top_bedrock_weathered_md: null,
            lithology_top_bedrock: null,
            lit_str_top_bedrock: null,
            chro_str_top_bedrock: null,
            remarks: "",
            national_relevance: null,
          },
        },
        ...{
          updater: {},
        },
        workgroup: null,
        workflow: null,
        role: null,
      },
    },
  };
  return function _borehole(state = initialState, action) {
    const { path } = action;
    if (path !== "/borehole/edit" && path !== "/borehole" && path !== "/workflow/edit") {
      return state;
    }

    if (path === "/workflow/edit") {
      switch (action.type) {
        case "SUBMIT_OK": {
          return {
            ...state,
            isLocking: false,
            data: {
              ...state.data,
              lock: null,
            },
          };
        }
        case "REJECT_OK": {
          return {
            ...state,
            isLocking: false,
            data: {
              ...state.data,
              lock: null,
            },
          };
        }
        default: {
          return state;
        }
      }
    } else {
      switch (action.type) {
        case "CLEAR": {
          return {
            ...initialState,
            fetchCount: state.fetchCount,
          };
        }
        case "GET": {
          return {
            ...initialState,
            fetchCount: state.fetchCount,
            fetchTime: new Date().getTime(),
            isFetching: true,
          };
        }
        case "GET_OK": {
          let copy = {
            ...state,
            fetchCount: state.fetchCount + 1,
            isFetching: false,
            fetchTime: new Date().getTime() - state.fetchTime,
            data: {
              ...initialState.data,
              ...action.json.data,
              extended: {
                ...initialState.data.extended,
                ...action.json.data.extended,
              },
              custom: {
                ...initialState.data.custom,
                ...action.json.data.custom,
              },
            },
          };
          return copy;
        }
        case "EDIT": {
          return {
            ...initialState,
            fetchCount: state.fetchCount,
            fetchTime: new Date().getTime(),
            isFetching: true,
          };
        }
        case "EDIT_OK": {
          let copy = {
            ...state,
            fetchCount: state.fetchCount + 1,
            isFetching: false,
            fetchTime: new Date().getTime() - state.fetchTime,
            data: {
              ...initialState.data,
              ...action.json.data,
              extended: {
                ...initialState.data.extended,
                ...action.json.data.extended,
              },
              custom: {
                ...initialState.data.custom,
                ...action.json.data.custom,
              },
            },
          };
          return copy;
        }
        case "EDIT_ERROR": {
          let copy = {
            ...state,
            fetchCount: state.fetchCount + 1,
            isFetching: false,
            fetchTime: new Date().getTime() - state.fetchTime,
            data: action.json.data,
            error: action.json.error,
          };
          return copy;
        }
        case "UPDATE": {
          return {
            ...state,
            data: action.data,
          };
        }
        case "LOCK": {
          return {
            ...state,
            isLocking: true,
          };
        }
        case "LOCK_OK": {
          return {
            ...state,
            isLocking: false,
            data: {
              ...state.data,
              lock: action.json.data,
            },
          };
        }
        case "UNLOCK": {
          return {
            ...state,
            isLocking: true,
          };
        }
        case "UNLOCK_OK": {
          return {
            ...state,
            isLocking: false,
            data: {
              ...state.data,
              lock: null,
            },
          };
        }
        default: {
          return state;
        }
      }
    }
  };
}

export function boreholeList() {
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
  return function boreholes(state = initialState, action) {
    const { path } = action;
    if (path !== "/borehole") {
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
          pages: Object.prototype.hasOwnProperty.call(action.json, "pages") ? action.json.pages : null,
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
    core_borehole: borehole(),
    core_borehole_list: boreholeList(),
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
