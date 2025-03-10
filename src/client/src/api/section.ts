import { User } from "./apiInterfaces.ts";
import { BoreholeV2 } from "./borehole.ts";

export interface Section {
  id: number;
  boreholeId: number;
  borehole: BoreholeV2 | null;
  name: string;
  createdById: number | null;
  createdBy: User | null;
  created: string | null;
  updatedById: number | null;
  updatedBy: User | null;
  updated: string | null;
  sectionElements: SectionElement[];
}

export interface SectionElement {
  id: number;
  sectionId: number;
  section: Section | null;
  fromDepth: number;
  toDepth: number;
  order: number;
  drillingMethodId: number | null;
  drillingStartDate: string | null;
  drillingEndDate: string | null;
  cuttingsId: number | null;
  drillingDiameter: number | null;
  drillingCoreDiameter: number | null;
  drillingMudTypeId: number | null;
  drillingMudSubtypeId: number | null;
  createdById: number | null;
  createdBy: User | null;
  created: string | null;
  updatedById: number | null;
  updatedBy: User | null;
  updated: string | null;
}
