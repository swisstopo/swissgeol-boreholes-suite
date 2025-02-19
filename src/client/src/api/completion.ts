import { User } from "./apiInterfaces.ts";
import { BoreholeV2 } from "./borehole.ts";

export interface Completion {
  id: number;
  boreholeId: number;
  borehole: BoreholeV2 | null;
  isPrimary: boolean;
  date: string;
  updated: Date | string | null;
  updatedById: number;
  updatedBy: User;
  name: string;
  qualityId: number;
  notes: string;
}
