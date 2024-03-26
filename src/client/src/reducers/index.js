import dataLoaderState from "../pages/settings/dataLoaderState";
import editor from "../pages/editor/editorState";
import searchEditor from "../commons/search/editor/searchEditorState";
import setting from "../pages/settings/settingState";
import wmts from "../commons/map/mapState";

import { injectReducer, store } from "../api-lib/index";

const queryString = window.location.search;

const developerState = {
  debug: new URLSearchParams(queryString).get("debug") ? true : false,
};

const developer = (state = developerState, action) => {
  switch (action.type) {
    case "DEBUG_SWITCH":
      return {
        ...state,
        debug: !state.debug,
      };

    default:
      return state;
  }
};

const reducers = {
  developer,
  dataLoaderState,
  searchEditor,
  editor,
  setting,
  wmts,
};

injectReducer(store, reducers);

export default store;
