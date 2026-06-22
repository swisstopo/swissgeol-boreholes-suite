import { injectReducer, store } from "../api-lib/index";
import wmts from "../components/map/mapState";
import editor from "../pages/overview/overviewPageState.js";

const reducers = {
  editor,
  wmts,
};

injectReducer(store, reducers);

export default store;
