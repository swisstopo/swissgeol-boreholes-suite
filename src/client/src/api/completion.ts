import { NullableDateString, User } from "./apiInterfaces.ts";
import { BoreholeV2 } from "./borehole.ts";

export interface Completion {
  id: number;
  boreholeId: number;
  borehole: BoreholeV2 | null;
  isPrimary: boolean;
  date: string;
  updated: NullableDateString;
  updatedById: number;
  updatedBy: User;
  name: string;
  qualityId: number;
  notes: string;
  casings: Casing[];
  backfills: Backfill[];
  instrumentations: Instrumentation[];
}

interface Casing {
  id: number;
}
interface Backfill {
  id: number;
}
interface Instrumentation {
  id: number;
}
