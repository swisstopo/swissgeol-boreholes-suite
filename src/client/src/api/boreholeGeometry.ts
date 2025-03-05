import { BoreholeV2 } from "./borehole.ts";

export interface BoreholeGeometry {
  id: number;
  boreholeId: number;
  borehole: BoreholeV2 | null;
  md: number;
  x: number;
  y: number;
  z: number;
  hazi: number | null;
  devi: number | null;
}
