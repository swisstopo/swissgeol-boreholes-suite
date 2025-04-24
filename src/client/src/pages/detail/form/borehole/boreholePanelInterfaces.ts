import { Ref } from "react";
import { BoreholeV2 } from "../../../../api/borehole.ts";
import { BoreholeFile } from "../../../../api/file/fileInterfaces.ts";

export interface BoreholeGeneralProps {
  borehole: BoreholeV2;
}

export interface BoreholeDetailProps extends BoreholeGeneralProps {
  onSubmit: (data: BoreholeFormInputs) => void;
  ref: Ref<unknown>;
}

export interface BoreholePanelProps extends BoreholeGeneralProps {
  onSubmit: (data: BoreholeFormInputs) => void;
  ref: Ref<unknown>;
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
  boreholeFiles: BoreholeFile[] | null;
}
