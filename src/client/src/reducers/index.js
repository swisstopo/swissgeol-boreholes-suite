import dataLoaderState from "../pages/settings/dataLoaderState";
import editor from "../pages/overview/overviewPageState.js";
import filters from "../pages/overview/sidePanelContent/filter/filterState.js";
import setting from "../pages/settings/settingState";
import wmts from "../components/map/mapState";

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
