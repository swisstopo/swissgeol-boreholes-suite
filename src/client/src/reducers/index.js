import dataLoaderState from '../pages/settings/dataLoaderState';
import home from '../pages/home/homeState';
import checkout from '../pages/checkout/checkoutState';
import editor from '../pages/editor/editorState';
import leftmenu from './leftmenu';
import detail_borehole from '../commons/detail/detailsState';
import search from '../commons/search/searchState';
import searchEditor from '../commons/search/editor/searchEditorState';
import setting from '../pages/settings/settingState';
import wmts from '../commons/map/mapState';

import {
  injectReducer, store
} from '@ist-supsi/bmsjs';


const queryString = window.location.search;

const developerState = {
  debug: new URLSearchParams(queryString).get('debug')?
    true: false
};

const developer = (state = developerState, action) => {

  switch (action.type) {

    case 'DEBUG_SWITCH':
      return {
        ...state,
        debug: !state.debug
      };

    default:
      return state;
  }
};

const reducers = {
  developer,
  dataLoaderState,
  leftmenu,
  home,
  checkout,
  detail_borehole,
  search,
  searchEditor,
  editor,
  setting,
  wmts
};

injectReducer(
  store,
  reducers
);

export default store;
