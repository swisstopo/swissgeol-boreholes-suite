import { NullableBooleanSelect, NullableDateString } from "../../../../api/apiInterfaces.ts";
import { Borehole, Profile } from "../../../../api/generated";
import { Workflow } from "../workflow/workflow.ts";

export interface BoreholeProps {
  borehole: Borehole;
}

export interface BoreholeFormInputs {
  name: string;
  originalName: string;
  projectName: string;
  restrictionId: number | null;
  restrictionUntil: NullableDateString;
  nationalInterest: NullableBooleanSelect;
  totalDepth: number | null;
  depthPrecisionId: number;
  typeId: number;
  purposeId: number;
  statusId: number;
  topBedrockFreshMd: number | null;
  topBedrockWeatheredMd: number | null;
  lithologyTopBedrockId: number;
  lithostratigraphyTopBedrockId: number;
  chronostratigraphyTopBedrockId: number;
  hasGroundwater: NullableBooleanSelect;
  remarks: string;
  topBedrockIntersected: NullableBooleanSelect;
  profiles: Profile[] | null;
  workflow: Workflow | null;
}
