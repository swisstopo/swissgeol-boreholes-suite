import dataLoaderState from "../pages/settings/dataLoaderState";
import editor from "../pages/editor/editorState";
import filters from "../commons/search/editor/filterState.js";
import setting from "../pages/settings/settingState";
import wmts from "../commons/map/mapState";

import { injectReducer, store } from "../api-lib/index";

const reducers = {
  dataLoaderState,
  filters,
  editor,
  setting,
  wmts,
};

injectReducer(store, reducers);

export default store;
