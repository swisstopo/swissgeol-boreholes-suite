import _ from "lodash";

const initialState = {
  isFetching: false,
  pathching: [],
  fetchTime: 0,
  fetchCount: 0,
  page: 0,
  selectedWMS: "https://wms.geo.admin.ch?request=getCapabilities&service=WMS",
  WMS: [
    {
      key: "https://wms.geo.admin.ch?request=getCapabilities&service=WMS",
      text: "https://wms.geo.admin.ch?request=getCapabilities&service=WMS",
      value: "https://wms.geo.admin.ch?request=getCapabilities&service=WMS",
    },
    {
      key: "https://wmts.geo.admin.ch/EPSG/2056/1.0.0/WMTSCapabilities.xml",
      text: "https://wmts.geo.admin.ch/EPSG/2056/1.0.0/WMTSCapabilities.xml",
      value: "https://wmts.geo.admin.ch/EPSG/2056/1.0.0/WMTSCapabilities.xml",
    },
  ],
  data: {
    boreholetable: {
      orderby: null,
      direction: null,
    },
    eboreholetable: {
      orderby: null,
      direction: null,
    },
    map: {
      explorer: {},
      editor: {},
    },
    appearance: {
      explorer: "mode-1",
    },
  },
};

const setting = (state = initialState, action) => {
  const { path } = action;
  if (path === "/setting") {
    switch (action.type) {
      case "GET": {
        return {
          ...initialState,
          fetchTime: new Date().getTime(),
          isFetching: true,
        };
      }
      case "GET_OK": {
        return {
          ...state,
          fetchCount: state.fetchCount + 1,
          isFetching: false,
          fetchTime: new Date().getTime() - state.fetchTime,
          data: _.merge(state.data, action.json.data),
        };
      }
      case "PATCH": {
        const copy = {
          ...state,
          isFetching: action.disableFetching !== true,
        };
        let path = null;

        if (Array.isArray(action.tree)) {
          for (let i = 0; i < action.tree.length; i++) {
            let element = action.tree[i];

            if (_.has(action, "key")) {
              path = _.union(
                ["data"],
                element.split("."),
                Array.isArray(action.key) === true ? action.key : [action.key],
              );
            } else {
              path = _.union(["data"], element.split("."));
            }
            if (action.value === null) {
              _.unset(copy, path, action.value);
            } else {
              _.set(copy, path, action.value);
            }
          }
        } else {
          if (_.has(action, "key")) {
            path = _.union(
              ["data"],
              action.tree.split("."),
              Array.isArray(action.key) === true ? action.key : [action.key],
            );
          } else {
            path = _.union(["data"], action.tree.split("."));
          }
          if (action.value === null) {
            _.unset(copy, path, action.value);
          } else {
            _.set(copy, path, action.value);
          }
        }
        return copy;
      }
      case "PATCH_OK": {
        return {
          ...state,
          fetchCount: state.fetchCount + 1,
          isFetching: false,
          fetchTime: new Date().getTime() - state.fetchTime,
          data: _.merge(state.data, action.json.data),
        };
      }
      default:
        return state;
    }
  }
  switch (action.type) {
    case "SETTING_TOGGLE_FILTER": {
      const copy = { ...state };
      _.set(copy, `data.filter.${action.filter}`, action.enabled);
      return copy;
    }
    case "SETTING_SET_PAGE": {
      return {
        ...state,
        page: action.page,
      };
    }
    case "WMS_ADDED": {
      return {
        ...state,
        selectedWMS: action.url,
        WMS: [
          {
            key: action.url,
            text: action.url,
            value: action.url,
          },
          ...state.WMS,
        ],
      };
    }
    case "WMS_SELECTED": {
      return {
        ...state,
        selectedWMS: action.url,
      };
    }
    default:
      return state;
  }
};

export default setting;
