import { SearchData } from "./searchDataInterfaces.ts";

export const lithostratigraphySearchData: SearchData[] = [
  {
    id: 0,
    type: "HierarchicalData",
    labels: ["formation", "member", "bed"],
    value: "lithostratigraphy_id",
    schema: "custom.lithostratigraphy_top_bedrock",
    isVisible: true,
  },
];
