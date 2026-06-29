import { SearchData } from "./filterInterfaces.ts";

export const identifierSearchData: SearchData[] = [
  {
    id: 0,
    type: "Dropdown",
    label: "boreholeIdentifier",
    key: "identifierTypeId",
    schema: "borehole_identifier",
  },
  {
    id: 1,
    type: "Input",
    label: "boreholeIdentifierValue",
    key: "identifierValue",
  },
];
