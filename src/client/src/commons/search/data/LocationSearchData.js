export const LocationSearchData = [
  {
    id: 0,
    type: "Dropdown",
    label: "borehole_identifier",
    value: "borehole_identifier",
    schema: "borehole_identifier",
    multiple: false,
    search: false,
    isVisibleValue: "custom.borehole_identifier",
    additionalValues: [
      {
        id: 0,
        code: "0",
        conf: null,
        de: {
          text: "",
          descr: "",
        },
        en: {
          text: "",
          descr: "",
        },
        fr: {
          text: "",
          descr: "",
        },
        it: {
          text: "",
          descr: "",
        },
        level: null,
        path: null,
        translationId: "borehole_technical_id",
      },
    ],
  },
  {
    id: 1,
    type: "Input",
    label: "borehole_identifier_value",
    value: "identifier_value",
    isVisibleValue: "custom.borehole_identifier",
  },
  {
    id: 2,
    type: "Input",
    label: "original_name",
    value: "original_name",
    isVisibleValue: "extended.original_name",
  },
  {
    id: 3,
    type: "Input",
    label: "project_name",
    value: "project_name",
    isVisibleValue: "custom.project_name",
  },
  {
    id: 4,
    type: "Input",
    label: "alternate_name",
    value: "alternate_name",
    isVisibleValue: "custom.alternate_name",
  },
  {
    id: 5,
    type: "Dropdown",
    label: "restriction",
    value: "restriction",
    schema: "restriction",
    multiple: false,
    search: false,
    isVisibleValue: "restriction",
  },
  {
    id: 6,
    type: "Date",
    label: "restriction_until",
    value: "restriction_until_from",
    placeholder: "afterdate",
    hasTwoFields: true,
    isVisibleValue: "restriction_until",
  },
  {
    id: 7,
    type: "Date",
    label: "",
    value: "restriction_until_to",
    placeholder: "beforedate",
    hasTwoFields: true,
    isVisibleValue: "restriction_until",
  },
  {
    id: 8,
    type: "Radio",
    label: "national_interest",
    value: "national_interest",
    to: false,
    hasUnknown: true,
    isVisibleValue: "national_interest",
  },
  {
    id: 9,
    type: "Input",
    label: "elevation_z",
    value: "elevation_z_from",
    isNumber: true,
    inputType: "number",
    placeholder: "fromelevation",
    hasTwoFields: true,
    isVisibleValue: "elevation_z",
  },
  {
    id: 10,
    type: "Input",
    label: "",
    value: "elevation_z_to",
    isNumber: true,
    inputType: "number",
    placeholder: "toelevation",
    hasTwoFields: true,
    isVisibleValue: "elevation_z",
  },
  {
    id: 11,
    type: "Input",
    label: "reference_elevation",
    value: "reference_elevation_from",
    isNumber: true,
    inputType: "number",
    placeholder: "fromelevation",
    hasTwoFields: true,
    isVisibleValue: "reference_elevation",
  },
  {
    id: 12,
    type: "Input",
    label: "",
    value: "reference_elevation_to",
    isNumber: true,
    inputType: "number",
    placeholder: "toelevation",
    hasTwoFields: true,
    isVisibleValue: "reference_elevation",
  },
  {
    id: 13,
    type: "Dropdown",
    label: "reference_elevation_type",
    value: "reference_elevation_type",
    schema: "reference_elevation_type",
    multiple: false,
    search: false,
    isVisibleValue: "reference_elevation_type",
  },
  {
    id: 14,
    type: "Dropdown",
    label: "location_precision",
    value: "location_precision",
    schema: "location_precision",
    multiple: false,
    search: false,
    isVisibleValue: "location_precision",
  },
  {
    id: 15,
    type: "Dropdown",
    label: "elevation_precision",
    value: "elevation_precision",
    schema: "elevation_precision",
    multiple: false,
    search: false,
    isVisibleValue: "elevation_precision",
  },
  {
    id: 16,
    type: "Dropdown",
    label: "reference_elevation_qt",
    value: "qt_reference_elevation",
    schema: "elevation_precision",
    multiple: false,
    search: false,
    isVisibleValue: "reference_elevation_qt",
  },
  {
    id: 17,
    type: "Canton",
    label: "canton",
    value: "canton",
    isVisibleValue: "custom.canton",
  },
  {
    id: 18,
    type: "ReferenceSystem",
    label: "spatial_reference_system",
    value: "spatial_reference_system",
    isVisibleValue: "spatial_reference_system",
    hasUnknown: true,
    to: false,
  },
];
