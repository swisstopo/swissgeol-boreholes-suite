import dataLoaderState from "../pages/settings/dataLoaderState";
import editor from "../pages/editor/editorState";
import searchEditor from "../commons/search/editor/searchEditorState";
import setting from "../pages/settings/settingState";
import wmts from "../commons/map/mapState";

import { injectReducer, store } from "../api-lib/index";

const reducers = {
  dataLoaderState,
  searchEditor,
  editor,
  setting,
  wmts,
};

injectReducer(store, reducers);

export default store;
