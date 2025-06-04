import { BasicIdentifier, BoreholeV2, Identifier } from "../../../../api/borehole.ts";
import { BoreholeFile } from "../../../../api/file/fileInterfaces.ts";
import { Codelist } from "../../../../components/codelist.ts";
import { WorkflowV2 } from "../workflow/workflow.ts";
import { ReferenceSystemCode } from "./coordinateSegmentInterfaces.ts";

export interface LocationBaseProps {
  borehole: BoreholeV2;
}

export interface LocationPanelProps extends LocationBaseProps {
  labelingPanelOpen: boolean;
}

interface LocationFormBaseInputs {
  name: string;
  originalName: string;
  projectName: number;
  restrictionId: number | null;
  restrictionUntil: Date | string | null;
  nationalInterest: number | boolean | null; // Number as select options parsed to boolean
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
  boreholeCodelists: BasicIdentifier[];
  boreholeFiles: BoreholeFile[] | null;
}

export interface LocationFormSubmission extends LocationFormBaseInputs {
  boreholeCodelists: Identifier[];
  precisionLocationX: number | null;
  precisionLocationY: number | null;
  precisionLocationXLV03: number | null;
  precisionLocationYLV03: number | null;
  locationXLV03: string | number | null;
  locationYLV03: string | number | null;
  locationY: string | number | null;
  locationX: string | number | null;
  codelists?: Codelist[];
  boreholeFiles: BoreholeFile[] | null;
  workflow: WorkflowV2 | null;
}
