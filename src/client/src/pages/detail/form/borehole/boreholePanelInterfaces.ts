import { BoreholeV2 } from "../../../../api/borehole.ts";
import { Profile } from "../../../../api/file/fileInterfaces.ts";
import { Workflow } from "../workflow/workflow.ts";

export interface BoreholeProps {
  borehole: BoreholeV2;
}

export interface BoreholeFormInputs {
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
  hasGroundwater: boolean | number | null;
  remarks: string;
  topBedrockIntersected: boolean | number | null;
  profiles: Profile[] | null;
  workflow: Workflow | null;
}
