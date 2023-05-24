export const InstrumentAttributes = [
  {
    id: 0,
    type: "Input",
    label: "fromdepth",
    value: "fromDepth",
    require: true,
    isNumber: true,
    isVisible: true,
  },
  {
    id: 1,
    type: "Input",
    label: "todepth",
    value: "toDepth",
    require: true,
    isNumber: true,
    isVisible: true,
  },
  {
    id: 2,
    type: "Input",
    label: "instrumentId",
    value: "instrument",
    require: true,
    isVisible: true,
  },
  {
    id: 3,
    type: "Dropdown",
    label: "kindInstrument",
    value: "instrumentKindId",
    require: true,
    schema: "inst100",
    multiple: false,
    search: false,
    isVisible: true,
  },
  {
    id: 4,
    type: "Dropdown",
    label: "statusInstrument",
    value: "instrumentStatusId",
    require: true,
    schema: "inst101",
    multiple: false,
    search: false,
    isVisible: true,
  },
  {
    id: 5,
    type: "CasingDropdown",
    label: "casingName",
    value: "instrumentCasingId",
    require: true,
    multiple: false,
    search: false,
    isVisible: true,
  },
  {
    id: 6,
    type: "CasingLayerDropdown",
    label: "casingId",
    value: "instrumentCasingLayerId",
    require: true,
    multiple: false,
    search: false,
    isVisible: true,
  },
  {
    id: 7,
    type: "Input",
    label: "notes",
    value: "notes",
    isVisible: true,
  },
  {
    id: 8,
    type: "Button",
    label: "delete",
    value: "",
    isVisible: true,
  },
];
