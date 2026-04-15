import { SearchData } from "./filterInterfaces.ts";

export const LocationSearchData: SearchData[] = [
  {
    id: 0,
    type: "Input",
    label: "originalName",
    value: "originalName",
  },
  {
    id: 1,
    type: "Input",
    label: "projectName",
    value: "projectName",
  },
  {
    id: 2,
    type: "Input",
    label: "alternate_name",
    value: "name",
  },
  {
    id: 3,
    type: "Dropdown",
    label: "restriction",
    value: "restrictionId",
    schema: "restriction",
  },
  {
    id: 4,
    type: "Date",
    label: "restriction_until",
    value: "restrictionUntilFrom",
    placeholder: "afterdate",
    hasTwoFields: true,
  },
  {
    id: 5,
    type: "Date",
    label: "",
    value: "restrictionUntilTo",
    placeholder: "beforedate",
    hasTwoFields: true,
  },
  {
    id: 6,
    type: "NullableBoolean",
    label: "national_interest",
    value: "nationalInterest",
  },
];
