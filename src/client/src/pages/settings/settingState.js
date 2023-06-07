import _ from "lodash";

const initialState = {
  isFetching: false,
  pathching: [],
  rtime: 0, // fetch time
  fcnt: 0, // fetch counter
  scrollbar: "10px",
  page: 0,
  selectedWMS: "https://wms.geo.admin.ch?request=getCapabilities&service=WMS",
  WMS: [
    {
      key: "https://wms.geo.admin.ch?request=getCapabilities&service=WMS",
      text: "https://wms.geo.admin.ch?request=getCapabilities&service=WMS",
      value: "https://wms.geo.admin.ch?request=getCapabilities&service=WMS",
    },
    {
      key: "https://wms-inspire.geo.admin.ch/?SERVICE=WMS&request=getCapabilities",
      text: "https://wms-inspire.geo.admin.ch/?SERVICE=WMS&request=getCapabilities",
      value:
        "https://wms-inspire.geo.admin.ch/?SERVICE=WMS&request=getCapabilities",
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
    filter: {
      mapfilter: true,
      zoom2selected: true,
      kind: true,
      restriction: true,
      restriction_until: true,
      location_x: true,
      location_y: true,
      srs: true,
      elevation_z: true,
      hrs: true,
      drilling_date: true,
      bore_inc: true,
      bore_inc_dir: true,
      length: true,
      extended: {
        original_name: true,
        method: true,
        purpose: true,
        status: true,
        top_bedrock: true,
        groundwater: true,
      },
      custom: {
        alternate_name: true,
        project_name: true,
        canton: true,
        city: true,
        address: true,
        landuse: true,
        cuttings: true,
        drill_diameter: true,
        lithology_top_bedrock: true,
        lithostratigraphy_top_bedrock: true,
        chronostratigraphy_top_bedrock: true,
        remarks: true,
      },

      // Layers / Stratigraphy filters
      layer: {
        depth: true,
        depth_from: false,
        depth_to: false,
        description: true,
        geology: true,
        lithology: true,
        color: true,
        plasticity: true,
        humidity: true,
        consistance: true,
        alteration: true,
        compactness: true,
        organic_component: true,
        striae: true,
        grain_size_1: true,
        grain_size_2: true,
        grain_shape: true,
        grain_granularity: true,
        cohesion: true,
        further_properties: true,
        uscs_1: true,
        uscs_2: true,
        uscs_3: true,
        uscs_determination: true,
        debris: true,
        lithology_top_bedrock: true,
      },
    },
    efilter: {
      kind: true,
      restriction: true,
      restriction_until: true,
      elevation_z: true,
      hrs: true,
      drilling_date: true,
      bore_inc: true,
      bore_inc_dir: true,
      length: true,
      extended: {
        original_name: true,
        method: true,
        purpose: true,
        status: true,
        top_bedrock: true,
        groundwater: true,
      },
      custom: {
        alternate_name: true,
        project_name: true,
        canton: true,
        city: true,
        address: true,
        landuse: true,
        cuttings: true,
        drill_diameter: true,
        lithology_top_bedrock: true,
        lithostratigraphy_top_bedrock: true,
        chronostratigraphy_top_bedrock: true,
        remarks: true,
      },

      // Layers / Stratigraphy filters
      layer: {
        depth: true,
        depth_from: false,
        depth_to: false,
        description: true,
        geology: true,
        lithology: true,
        lithostratigraphy: true,
        color: true,
        plasticity: true,
        humidity: true,
        consistance: true,
        alteration: true,
        compactness: true,
        organic_component: true,
        striae: true,
        grain_size_1: true,
        grain_size_2: true,
        grain_shape: true,
        grain_granularity: true,
        cohesion: true,
        further_properties: true,
        uscs_1: true,
        uscs_2: true,
        uscs_3: true,
        uscs_determination: true,
        debris: true,
        lithology_top_bedrock: true,
      },
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
          rtime: new Date().getTime(),
          isFetching: true,
        };
      }
      case "GET_OK": {
        let copy = {
          ...state,
          fcnt: state.fcnt + 1,
          isFetching: false,
          rtime: new Date().getTime() - state.rtime,
          data: _.merge(state.data, action.json.data),
        };
        return copy;
      }
      case "PATCH": {
        const copy = {
          ...state,
          isFetching: action.disableFetching === true ? false : true,
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
        let copy = {
          ...state,
          fcnt: state.fcnt + 1,
          isFetching: false,
          rtime: new Date().getTime() - state.rtime,
          data: _.merge(state.data, action.json.data),
        };
        return copy;
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
    case "SETTING_SCROLLBAR_WIDTH": {
      return {
        ...state,
        scrollbar: action.width,
      };
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
