import { User } from "./apiInterfaces.ts";
import { BoreholeV2 } from "./borehole.ts";

export interface Observation {
  id: number;
  boreholeId: number;
  borehole: BoreholeV2 | null;
  date: string;
  updated: Date | string | null;
  updatedById: number;
  updatedBy: User;
  name: string;
  type: number;
}
