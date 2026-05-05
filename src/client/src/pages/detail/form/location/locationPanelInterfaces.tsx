import { BoreholeV2 } from "../../../../api/borehole.ts";
import { Profile } from "../../../../api/profile.ts";
import { Codelist } from "../../../../components/codelist.ts";
import { Workflow } from "../workflow/workflow.ts";
import { ReferenceSystemCode } from "./coordinateSegmentInterfaces.ts";

export interface LocationBaseProps {
  borehole: BoreholeV2;
}

export interface LocationPanelProps extends LocationBaseProps {
  labelingPanelOpen: boolean;
}

interface LocationFormBaseInputs {
  elevationZ: number | string | null; // Number with thousands separator then parsed to number
  elevationPrecisionId: number | null;
  referenceElevation: number | string | null; // Number with thousands separator then parsed to number
  referenceElevationPrecisionId: number | null;
  referenceElevationTypeId: number | null;
  originalReferenceSystem: ReferenceSystemCode | null;
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
  profiles: Profile[] | null;
}

export interface LocationFormSubmission extends LocationFormBaseInputs {
  precisionLocationX: number | null;
  precisionLocationY: number | null;
  precisionLocationXLV03: number | null;
  precisionLocationYLV03: number | null;
  locationXLV03: string | number | null;
  locationYLV03: string | number | null;
  locationY: string | number | null;
  locationX: string | number | null;
  codelists?: Codelist[];
  profiles: Profile[] | null;
  workflow: Workflow | null;
}
