import { RefObject } from "react";
import { BoreholeV2 } from "../../../../api/borehole.ts";

export interface LocationBaseProps {
  editingEnabled: boolean;
  borehole: BoreholeV2;
}

export interface LocationPanelProps extends LocationBaseProps {
  onSubmit: (data: LocationFormInputs) => void;
  onDirtyChange: (isDirty: boolean) => void;
  ref: RefObject<{ submit: () => void; reset: () => void }>;
}

interface LocationFormBaseInputs {
  alternateName: string;
  originalName: string;
  projectName: number;
  restrictionId: number | null;
  restrictionUntil: Date | string | null;
  nationalInterest: number | boolean | null; // Number as select options parsed to boolean
  elevationZ: number | string | null; // Number with thousands separator then parsed to number
  elevationPrecisionId: number | null;
  referenceElevation: number | string | null; // Number with thousands separator then parsed to number
  qtReferenceElevationId: number | null;
  referenceElevationTypeId: number | null;
  originalReferenceSystem: number | null;
  hrsId?: number;
  country: string;
  canton: string;
  municipality: string;
  locationPrecisionId: number | null;
}
export interface LocationFormInputs extends LocationFormBaseInputs {
  locationXLV03: string;
  locationYLV03: string;
  locationY: string;
  locationX: string;
}

export interface BoreholeSubmission extends LocationFormBaseInputs {
  precisionLocationX: number | null;
  precisionLocationY: number | null;
  precisionLocationXLV03: number | null;
  precisionLocationYLV03: number | null;
  locationXLV03: string | number | null;
  locationYLV03: string | number | null;
  locationY: string | number | null;
  locationX: string | number | null;
}
