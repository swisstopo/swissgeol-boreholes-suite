import _ from "lodash";

const initialState = {
  isFetching: false,
  advanced: false,
  mapfilter: false,
  center2selected: false,
  zoom2selected: false,
  extent: null,
  filter: {
    refresh: 0,
    borehole_identifier: null,
    identifier_value: "",
    workgroup: "all",
    original_name: "",
    alternate_name: "",
    project_name: "",
    kind: null,
    method: null,
    purpose: null,
    landuse: null,
    restriction: null,
    restriction_until_from: "",
    restriction_until_to: "",
    drilling_date_from: "",
    drilling_date_to: "",
    elevation_z_from: "",
    elevation_z_to: "",
    length_from: "",
    length_to: "",
    top_bedrock_from: "",
    top_bedrock_to: "",
    groundwater: -1,
    status: null,
    extent: null,
    canton: null,
    municipality: null,
    address: "",
    cuttings: null,
    drill_diameter_from: "",
    drill_diameter_to: "",
    bore_inc_from: "",
    bore_inc_to: "",
    bore_inc_dir_from: "",
    bore_inc_dir_to: "",
    lithology_top_bedrock: null,
    lithostratigraphy_top_bedrock: null,
    chronostratigraphy_top_bedrock: null,

    // Layers filter
    layer_depth_from: "",
    layer_depth_to: "",

    layer_depth_from_from: "",
    layer_depth_from_to: "",

    layer_depth_to_from: "",
    layer_depth_to_to: "",

    layer_description: "",
    layer_geology: "",

    lithology: null,
    lithostratigraphy: null,
    chronostratigraphy: null,

    color: null,
    plasticity: null,
    humidity: null,
    consistance: null,
    alteration: null,
    compactness: null,
    organic_component: null,
    striae: -1,
    grain_size_1: null,
    grain_size_2: null,
    grain_shape: null,
    grain_granularity: null,
    cohesion: null,
    layer_further_properties: null,
    layer_lithology_top_bedrock: null,
    uscs_1: null,
    uscs_2: null,
    uscs_3: null,
    uscs_determination: null,
    debris: null,

    //new filters
    casing_name: "",
    date_abd_from: null,
    date_abd_to: null,
    casing_id: null,
    casing_depth_from_from: "",
    casing_depth_from_to: "",
    casing_depth_to_from: "",
    casing_depth_to_to: "",
    casing_kind: null,
    casing_material: null,
    casing_date_spud_from: null,
    casing_date_spud_to: null,
    casing_date_finish_from: null,
    casing_date_finish_to: null,
    casing_inner_diameter_from: null,
    casing_inner_diameter_to: null,
    casing_outer_diameter_from: null,
    casing_outer_diameter_to: null,

    instrument_depth_from_from: "",
    instrument_depth_from_to: "",
    instrument_depth_to_from: "",
    instrument_depth_to_to: "",
    instrument_kind: null,
    instrument_status: null,
    instrument_id: "",

    fill_name: "",
    fill_kind: null,
    backfill_depth_from_from: "",
    backfill_depth_from_to: "",
    backfill_depth_to_from: "",
    backfill_depth_to_to: "",
    fill_material: null,

    qt_description: null,
    uscs_original: "",
    original_lithology: "",
    layer_gradation: null,

    spud_date_from: "",
    spud_date_to: "",
    qt_inclination_direction: null,
    total_depth_tvd_from: "",
    total_depth_tvd_to: "",
    top_bedrock_tvd_from: "",
    top_bedrock_tvd_to: "",
    qt_depth: null,
    qt_total_depth_tvd: null,
    qt_top_bedrock: null,
    qt_top_bedrock_tvd: null,

    reference_elevation_type: null,
    qt_reference_evelation: null,
    qt_elevation: null,
    qt_location: null,
    reference_elevation_from: "",
    reference_elevation_to: "",
    srs: null,
  },
};

const search = (
  state = {
    ...initialState,
    filter: {
      ...initialState.filter,
    },
    stratigraphyFilter: {
      ...initialState.stratigraphyFilter,
    },
  },
  action,
) => {
  switch (action.type) {
    case "SEARCH_MAPFILTER_CHANGED": {
      if (action.active === true) {
        return {
          ...state,
          filter: {
            ...state.filter,
            extent: state.extent,
          },
          mapfilter: action.active,
        };
      }
      return {
        ...state,
        filter: {
          ...state.filter,
          extent: null,
        },
        mapfilter: action.active,
      };
    }
    case "SEARCH_CENTER2_CHANGED": {
      if (action.active === true) {
        return {
          ...state,
          center2selected: action.active,
        };
      }
      return {
        ...state,
        center2selected: action.active,
      };
    }
    case "SEARCH_ZOOM2_CHANGED": {
      if (action.active === true) {
        return {
          ...state,
          zoom2selected: action.active,
        };
      }
      return {
        ...state,
        zoom2selected: action.active,
      };
    }
    case "SEARCH_FILTER_CHANGED": {
      const copy = {
        ...state,
        filter: {
          ...state.filter,
        },
      };

      let keys = [];

      if (_.isArray(action.key)) {
        keys = action.key;
      } else {
        keys = [action.key];
      }

      for (let index = 0; index < keys.length; index++) {
        const path = `filter.${keys[index]}`;
        if (_.has(copy, path)) {
          if (_.isNil(action.value) || action.value === "") {
            if (_.isString(action.value)) {
              _.set(copy, path, "");
            } else {
              _.set(copy, path, null);
            }
          } else {
            _.set(copy, path, action.value);
          }
        }
      }

      return copy;
    }
    case "SEARCH_FILTER_RESET_IDENTIFIER": {
      const copy = {
        ...state,
        filter: {
          ...state.filter,
        },
      };
      copy.filter.borehole_identifier = null;
      copy.filter.identifier_value = "";
      return copy;
    }
    case "SEARCH_FILTER_RESET_RESTRICTION": {
      const copy = {
        ...state,
        filter: {
          ...state.filter,
        },
      };
      copy.filter.restriction_until_from = "";
      copy.filter.restriction_until_to = "";
      return copy;
    }
    case "SEARCH_FILTER_RESET_DRILLING": {
      const copy = {
        ...state,
        filter: {
          ...state.filter,
        },
      };
      copy.filter.drilling_date_from = "";
      copy.filter.drilling_date_to = "";
      return copy;
    }
    case "SEARCH_FILTER_RESET_DRILL_DIAMETER": {
      const copy = {
        ...state,
        filter: {
          ...state.filter,
        },
      };
      copy.filter.drill_diameter_from = "";
      copy.filter.drill_diameter_to = "";
      return copy;
    }
    case "SEARCH_FILTER_RESET_BORE_INC": {
      const copy = {
        ...state,
        filter: {
          ...state.filter,
        },
      };
      copy.filter.bore_inc_from = "";
      copy.filter.bore_inc_to = "";
      return copy;
    }
    case "SEARCH_FILTER_RESET_BORE_INC_DIR": {
      const copy = {
        ...state,
        filter: {
          ...state.filter,
        },
      };
      copy.filter.bore_inc_dir_from = "";
      copy.filter.bore_inc_dir_to = "";
      return copy;
    }
    case "SEARCH_FILTER_RESET_ELEVATION": {
      const copy = {
        ...state,
        filter: {
          ...state.filter,
        },
      };
      copy.filter.elevation_z_from = "";
      copy.filter.elevation_z_to = "";
      return copy;
    }
    case "SEARCH_FILTER_RESET_DEPTH": {
      const copy = {
        ...state,
        filter: {
          ...state.filter,
        },
      };
      copy.filter.length_from = "";
      copy.filter.length_to = "";
      return copy;
    }
    case "SEARCH_FILTER_RESET_TOP_BEDROCK": {
      const copy = {
        ...state,
        filter: {
          ...state.filter,
        },
      };
      copy.filter.top_bedrock_from = "";
      copy.filter.top_bedrock_to = "";
      return copy;
    }
    case "SEARCH_FILTER_REFRESH": {
      const copy = {
        ...state,
        filter: {
          ...state.filter,
        },
      };
      copy.filter.refresh = copy.filter.refresh + 1;
      return copy;
    }
    case "SEARCH_FILTER_RESET": {
      return {
        ...state,
        filter: {
          ...initialState.filter,
        },
      };
    }
    case "SEARCH_EXTENT_CHANGED": {
      if (state.mapfilter === true) {
        return {
          ...state,
          extent: action.extent,
          resolution: action.resolution,
          filter: {
            ...state.filter,
            extent: action.extent,
          },
        };
      }
      return {
        ...state,
        extent: action.extent,
        resolution: action.resolution,
      };
    }

    default:
      return state;
  }
};

export default search;
