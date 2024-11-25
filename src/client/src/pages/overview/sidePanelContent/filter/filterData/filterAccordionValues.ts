import { boreholeSearchData } from "./boreholeSearchData.ts";
import { chronostratigraphySearchData } from "./chronostratigraphySearchData.ts";
import { lithologySearchData } from "./lithologySearchData.ts";
import { lithostratigraphySearchData } from "./lithostratigraphySearchData.ts";
import { LocationSearchData } from "./LocationSearchData.ts";
import { registrationSearchData } from "./registrationSearchData.ts";
import { SearchData } from "./searchDataInterfaces.ts";

export interface FilterAccordionValue {
  id: number;
  name: string;
  translationId: string;
  isSelected: boolean;
  searchData: SearchData[];
  hideShowAllFields?: boolean;
}

export const filterAccordionValues: FilterAccordionValue[] = [
  {
    id: 0,
    name: "workgroup",
    translationId: "workgroup",
    isSelected: false,
    hideShowAllFields: true,
    searchData: [{ id: 0, value: "workgroup" }],
  },
  {
    id: 1,
    name: "status",
    translationId: "status",
    isSelected: false,
    hideShowAllFields: true,
    searchData: [{ id: 0, value: "role" }],
  },
  {
    id: 2,
    name: "location",
    translationId: "location",
    isSelected: false,
    searchData: LocationSearchData,
  },
  {
    id: 3,
    name: "borehole",
    translationId: "borehole",
    isSelected: false,
    searchData: boreholeSearchData,
  },
  {
    id: 4,
    name: "lithology",
    translationId: "lithology",
    isSelected: false,
    searchData: lithologySearchData,
  },
  {
    id: 5,
    name: "chronostratigraphy",
    translationId: "chronostratigraphy",
    isSelected: false,
    hideShowAllFields: true,
    searchData: chronostratigraphySearchData,
  },
  {
    id: 6,
    name: "lithostratigraphy",
    translationId: "lithostratigraphy",
    isSelected: false,
    hideShowAllFields: true,
    searchData: lithostratigraphySearchData,
  },
  {
    id: 7,
    name: "registration",
    translationId: "registration",
    isSelected: false,
    searchData: registrationSearchData,
  },
];
