import { User } from "./apiInterfaces.ts";
import { BoreholeV2 } from "./borehole.ts";

export interface Stratigraphy {
  id: number;
  boreholeId: number;
  borehole: BoreholeV2 | null;
  isPrimary: boolean;
  date: string;
  created: Date | string | null;
  createdById: number;
  createdBy?: User;
  updated: Date | string | null;
  updatedById: number;
  updatedBy?: User;
  name: string;
  qualityId: number;
  notes: string;
  layers: Layer[];
  chronostratigraphyLayers: ChronoStratigraphy[];
  lithostratigraphyLayers: LithoStratigraphy[];
}

export interface Layer {
  id: number;
  stratigraphyId: number;
}

export interface ChronoStratigraphy {
  id: number;
  stratigraphyId: number;
}

export interface LithoStratigraphy {
  id: number;
  stratigraphyId: number;
}
