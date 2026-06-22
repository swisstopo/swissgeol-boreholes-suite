import { injectReducer, store } from "../api-lib/index";
import wmts from "../components/map/mapState";
import editor from "../pages/overview/overviewPageState.js";
import setting from "../pages/settings/settingState";

const reducers = {
  editor,
  setting,
  wmts,
};

injectReducer(store, reducers);

export default store;
