import { Borehole, Profile } from "../../../../api/generated";
import { NullableBooleanSelect, NullableDateString } from "../../../../api/unionTypes.ts";
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
  depthPrecisionId: number | null;
  typeId: number | null;
  purposeId: number | null;
  statusId: number | null;
  topBedrockFreshMd: number | null;
  topBedrockWeatheredMd: number | null;
  lithologyTopBedrockId: number | null;
  lithostratigraphyTopBedrockId: number | null;
  chronostratigraphyTopBedrockId: number | null;
  hasGroundwater: NullableBooleanSelect;
  remarks: string;
  topBedrockIntersected: NullableBooleanSelect;
  profiles: Profile[] | null;
  workflow: Workflow | null;
}
