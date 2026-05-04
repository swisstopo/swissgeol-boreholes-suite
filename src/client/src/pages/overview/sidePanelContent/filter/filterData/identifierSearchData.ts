import { SearchData } from "./filterInterfaces.ts";

export const identifierSearchData: SearchData[] = [
  {
    id: 0,
    type: "Dropdown",
    label: "borehole_identifier",
    key: "identifierTypeId",
    schema: "borehole_identifier",
  },
  {
    id: 1,
    type: "Input",
    label: "identifier_value",
    key: "identifierValue",
  },
];
