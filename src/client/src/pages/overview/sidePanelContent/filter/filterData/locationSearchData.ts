import { SearchData } from "./filterInterfaces.ts";

export const LocationSearchData: SearchData[] = [
  // missing here IDs
  {
    id: 2,
    type: "Input",
    label: "originalName",
    value: "originalName",
  },
  {
    id: 3,
    type: "Input",
    label: "projectName",
    value: "projectName",
  },
  {
    id: 4,
    type: "Input",
    label: "alternate_name",
    value: "name",
  },
  {
    id: 5,
    type: "Dropdown",
    label: "restriction",
    value: "restrictionId",
    schema: "restriction",
  },
  {
    id: 6,
    type: "Date",
    label: "restriction_until",
    value: "restrictionUntilFrom",
    placeholder: "afterdate",
    hasTwoFields: true,
  },
  {
    id: 7,
    type: "Date",
    label: "",
    value: "restrictionUntilTo",
    placeholder: "beforedate",
    hasTwoFields: true,
  },
  {
    id: 8,
    type: "TriStateBoolean",
    label: "national_interest",
    value: "nationalInterest",
  },
];
