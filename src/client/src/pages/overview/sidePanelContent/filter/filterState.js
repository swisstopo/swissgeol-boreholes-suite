import _ from "lodash";

const initialState = {
  isFetching: false,
  filter: {
    refresh: 1,
    borehole_identifier: null,
    identifier_value: "",
    workflow: "all",
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
    top_bedrock_fresh_md_from: "",
    top_bedrock_fresh_md_to: "",
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

    description_quality: null,
    uscs_original: "",
    original_lithology: "",
    layer_gradation: null,

    qt_depth: null,
    top_bedrock_weathered_md_from: "",
    top_bedrock_weathered_md_to: "",

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

const filters = (
  state = {
    ...initialState,
    filter: {
      ...initialState.filter,
    },
  },
  action,
) => {
  switch (action.type) {
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

    case "SEARCH_EDITOR_FILTER_RESET": {
      return {
        ...state,
        filter: {
          ...initialState.filter,
        },
      };
    }
    default:
      return state;
  }
};

export default filters;
