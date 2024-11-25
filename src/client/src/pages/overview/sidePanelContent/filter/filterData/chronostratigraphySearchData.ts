import { SearchData } from "./searchDataInterfaces.ts";

export const chronostratigraphySearchData: SearchData[] = [
  {
    id: 0,
    type: "HierarchicalData",
    labels: ["eon", "era", "period", "epoch", "subepoch", "age", "subage"],
    value: "chronostratigraphy_id",
    schema: "custom.chronostratigraphy_top_bedrock",
    isVisible: true,
    hideShowAllFields: true,
  },
];
