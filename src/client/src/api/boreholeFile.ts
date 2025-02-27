import { BoreholeV2 } from "./borehole.ts";

export interface BoreholeFile {
  id: number;
  boreholeId: number;
  borehole: BoreholeV2 | null;
}
