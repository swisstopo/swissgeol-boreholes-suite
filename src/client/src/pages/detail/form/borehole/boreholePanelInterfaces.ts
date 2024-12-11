import { BoreholeV2 } from "../../../../api/borehole.ts";

export interface BoreholeGeneralProps {
  borehole: BoreholeV2;
  editingEnabled: boolean;
}

export interface BoreholeDetailProps extends BoreholeGeneralProps {
  onSubmit: (data: BoreholeFormInputs) => void;
}

export interface BoreholePanelProps extends BoreholeGeneralProps {
  boreholeId: string;
  onSubmit: (data: BoreholeFormInputs) => void;
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
  lithostratigraphyId: number;
  chronostratigraphyId: number;
  hasGroundwater: boolean | number | null;
  remarks: string;
}
