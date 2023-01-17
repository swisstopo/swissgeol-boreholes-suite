export const stratigraphyData = {
  profileInfo: [
    {
      id: 0,
      type: "Input",
      label: "stratigraphy_name",
      value: "name",
      require: true,
    },
    {
      id: 1,
      type: "Date",
      label: "date",
      value: "date",
    },
  ],
  profileAttribute: [
    {
      id: 0,
      type: "Input",
      label: "layer_depth_from",
      value: "depth_from",
      require: true,
      isNumber: true,
      isVisible: true,
    },
    {
      id: 1,
      type: "Input",
      label: "layer_depth_to",
      value: "depth_to",
      require: true,
      isNumber: true,
      isVisible: true,
    },
    {
      id: 2,
      type: "TextArea",
      label: "lithological_description",
      value: "lithological_description",
      isVisibleValue: "lithological_description",
    },
    {
      id: 3,
      type: "TextArea",
      label: "facies_description",
      value: "facies_description",
      isVisibleValue: "facies_description",
    },
    {
      id: 4,
      type: "Radio",
      label: "layer_last",
      value: "last",
      to: false,
      isVisibleValue: "layer_last",
    },
    {
      id: 5,
      type: "Dropdown",
      label: "qt_description",
      value: "qt_description",
      schema: "qt_description",
      multiple: false,
      search: false,
      require: true,
      isVisibleValue: "qt_description",
    },
    {
      id: 6,
      type: "DomainTree",
      label: "lithology",
      value: "lithology",
      schema: "custom.lithology_top_bedrock",
      levels: {
        1: "rock",
        2: "process",
        3: "type",
      },

      require: true,
      isVisibleValue: "lithology",
    },
    {
      id: 7,
      type: "DomainTree",
      label: "lithostratigraphy",
      value: "lithostratigraphy",
      schema: "custom.lithostratigraphy_top_bedrock",
      levels: {
        1: "super",
        2: "group",
        3: "subgroup",
        4: "superformation",
        5: "formation",
      },
      require: true,
      isVisibleValue: "lithostratigraphy",
    },
    {
      id: 8,
      type: "DomainTree",
      label: "chronostratigraphy",
      value: "chronostratigraphy",
      schema: "custom.chronostratigraphy_top_bedrock",
      levels: {
        1: "1st_order_eon",
        2: "2nd_order_era",
        3: "3rd_order_period",
        4: "4th_order_epoch",
        5: "5th_order_sub_epoch",
        6: "6th_order_sub_stage",
      },
      require: false,
      isVisibleValue: "chronostratigraphy",
    },
    {
      id: 9,
      type: "Input",
      label: "uscs_original",
      value: "uscs_original",
      require: false,
      isVisibleValue: "uscs_original",
    },
    {
      id: 10,
      type: "Dropdown",
      label: "uscs_determination",
      value: "uscs_determination",
      schema: "mcla104",
      multiple: false,
      search: true,
      isVisibleValue: "uscs_determination",
    },
    {
      id: 11,
      type: "Dropdown",
      label: "uscs_1",
      value: "uscs_1",
      schema: "mcla101",
      multiple: false,
      search: false,
      isVisibleValue: "uscs_1",
    },
    {
      id: 12,
      type: "Dropdown",
      label: "grain_size_1",
      value: "grain_size_1",
      schema: "mlpr109",
      multiple: false,
      search: false,
      isVisibleValue: "grain_size_1",
    },
    {
      id: 13,
      type: "Dropdown",
      label: "uscs_2",
      value: "uscs_2",
      schema: "mcla101",
      multiple: false,
      search: false,
      isVisibleValue: "uscs_2",
    },
    {
      id: 14,
      type: "Dropdown",
      label: "grain_size_2",
      value: "grain_size_2",
      schema: "mlpr109",
      multiple: false,
      search: false,
      isVisibleValue: "grain_size_2",
    },
    {
      id: 15,
      type: "Dropdown",
      label: "uscs_3",
      value: "uscs_3",
      schema: "mcla101",
      multiple: true,
      search: false,
      isVisibleValue: "uscs_3",
    },
    {
      id: 16,
      type: "Dropdown",
      label: "grain_shape",
      value: "grain_shape",
      schema: "mlpr110",
      multiple: true,
      search: true,
      isVisibleValue: "grain_shape",
    },
    {
      id: 17,
      type: "Dropdown",
      label: "grain_granularity",
      value: "grain_granularity",
      schema: "mlpr115",
      multiple: true,
      search: true,
      isVisibleValue: "grain_granularity",
    },
    {
      id: 18,
      type: "Dropdown",
      label: "organic_component",
      value: "organic_component",
      schema: "mlpr108",
      multiple: true,
      search: true,
      isVisibleValue: "organic_component",
    },
    {
      id: 19,
      type: "Dropdown",
      label: "debris",
      value: "debris",
      schema: "mcla107",
      multiple: true,
      search: true,
      isVisibleValue: "debris",
    },
    {
      id: 20,
      type: "Dropdown",
      label: "lithology_top_bedrock",
      value: "lithology_top_bedrock",
      schema: "custom.lithology_top_bedrock",
      multiple: false,
      search: true,
      isVisibleValue: "lithology_top_bedrock",
    },
    {
      id: 21,
      type: "Radio",
      label: "striae",
      value: "striae",
      to: false,
      isVisibleValue: "striae",
    },
    {
      id: 22,
      type: "Dropdown",
      label: "color",
      value: "color",
      schema: "mlpr112",
      multiple: true,
      search: true,
      isVisibleValue: "color",
    },
    {
      id: 23,
      type: "Dropdown",
      label: "consistance",
      value: "consistance",
      schema: "mlpr103",
      multiple: false,
      search: true,
      isVisibleValue: "consistance",
    },
    {
      id: 24,
      type: "Dropdown",
      label: "plasticity",
      value: "plasticity",
      schema: "mlpr101",
      multiple: false,
      search: false,
      isVisibleValue: "plasticity",
    },
    {
      id: 25,
      type: "Dropdown",
      label: "compactness",
      value: "compactness",
      schema: "mlpr102",
      multiple: false,
      search: false,
      isVisibleValue: "compactness",
    },
    {
      id: 26,
      type: "Dropdown",
      label: "cohesion",
      value: "cohesion",
      schema: "mlpr116",
      multiple: false,
      search: false,
      isVisibleValue: "cohesion",
    },
    {
      id: 27,
      type: "Dropdown",
      label: "gradation",
      value: "gradation",
      schema: "gradation",
      multiple: false,
      search: true,
      isVisibleValue: "gradation",
    },
    {
      id: 28,
      type: "Dropdown",
      label: "humidity",
      value: "humidity",
      schema: "mlpr105",
      multiple: false,
      search: false,
      isVisibleValue: "humidity",
    },
    {
      id: 29,
      type: "Dropdown",
      label: "alteration",
      value: "alteration",
      schema: "mlpr106",
      multiple: false,
      search: false,
      isVisibleValue: "alteration",
    },
    {
      id: 30,
      type: "TextArea",
      label: "notes",
      value: "notes",
      isVisibleValue: "notes",
    },
  ],
};
