import { BoreholeV2 } from "./borehole.ts";

export interface Section {
  id: number;
  boreholeId: number;
  borehole: BoreholeV2 | null;
}
