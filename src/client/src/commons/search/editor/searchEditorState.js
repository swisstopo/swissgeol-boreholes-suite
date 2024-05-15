import _ from "lodash";

const initialState = {
  isFetching: false,
  mapfilter: false,
  filter: {
    refresh: 1,
    borehole_identifier: null,
    identifier_value: "",
    role: "all",
    workgroup: "all",
    original_name: "",
    alternate_name: "",
    borehole_type: null,
    restriction: null,
    project_name: "",
    landuse: null,
    restriction_until_from: "",
    restriction_until_to: "",
    national_interest: -1,
    elevation_z_from: "",
    elevation_z_to: "",
    length_from: "",
    length_to: "",
    groundwater: -1,
    top_bedrock_from: "",
    top_bedrock_to: "",
    status: null,
    purpose: null,
    lithology_top_bedrock: null,
    lithostratigraphy_top_bedrock: null,
    chronostratigraphy_top_bedrock: null,
    canton: null,
    municipality: null,
    address: "",

    project: null,
    last_update: "",
    creation: "",

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

    // Chronostratigraphy filter
    chronostratigraphy_id: null,

    // Lithostratigraphy filter
    lithostratigraphy_id: null,

    description_quality: null,
    uscs_original: "",
    original_lithology: "",
    layer_gradation: null,

    total_depth_tvd_from: "",
    total_depth_tvd_to: "",
    top_bedrock_tvd_from: "",
    top_bedrock_tvd_to: "",
    qt_depth: null,
    qt_total_depth_tvd: null,
    qt_top_bedrock_from: "",
    qt_top_bedrock_to: "",
    qt_top_bedrock_tvd_from: "",
    qt_top_bedrock_tvd_to: "",

    reference_elevation_type: null,
    qt_reference_elevation: null,
    elevation_precision: null,
    location_precision: null,
    reference_elevation_from: "",
    reference_elevation_to: "",
    spatial_reference_system: null,

    created_by: "",
    created_date_from: null,
    created_date_to: null,
  },
};

const searchEditor = (
  state = {
    ...initialState,
    filter: {
      ...initialState.filter,
    },
  },
  action,
) => {
  switch (action.type) {
    case "SEARCH_EDITOR_MAPFILTER_CHANGED": {
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
    case "SEARCH_EDITOR_FILTER_CHANGED": {
      const copy = {
        ...state,
        filter: {
          ...state.filter,
        },
      };
      const path = `filter.${action.key}`;
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
      return copy;
    }
    case "SEARCH_EDITOR_FILTER_RESET_IDENTIFIER": {
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
    case "SEARCH_EDITOR_FILTER_RESET_RESTRICTION": {
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
    case "SEARCH_EDITOR_FILTER_RESET_ELEVATION": {
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
    case "SEARCH_EDITOR_FILTER_RESET_TOP_BEDROCK": {
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
    case "SEARCH_EDITOR_FILTER_REFRESH": {
      const copy = {
        ...state,
        filter: {
          ...state.filter,
        },
      };
      copy.filter.refresh = copy.filter.refresh + 1;
      return copy;
    }
    case "SEARCH_EDITOR_FILTER_RESET_DEPTH": {
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

    case "SEARCH_EDITOR_FILTER_RESET": {
      return {
        ...state,
        filter: {
          ...initialState.filter,
        },
      };
    }
    case "SEARCH_EDITOR_PROJECT_CHANGED": {
      return {
        ...state,
        filter: {
          ...state.filter,
          project: action.id,
        },
      };
    }
    case "SEARCH_EDITOR_LASTUPDATE_CHANGED": {
      return {
        ...state,
        filter: {
          ...state.filter,
          last_update: action.date,
        },
      };
    }
    case "SEARCH_EDITOR_CREATION_CHANGED": {
      return {
        ...state,
        filter: {
          ...state.filter,
          creation: action.date,
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
    case "SEARCH_EDITOR_FILTER_RESET_CREATED_DATE": {
      const copy = { ...state };
      copy.filter.created_date_from = null;
      copy.filter.created_date_to = null;
      return copy;
    }
    default:
      return state;
  }
};

export default searchEditor;
