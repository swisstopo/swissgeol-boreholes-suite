import { UseFormReturn } from "react-hook-form";
import { BoreholeV2 } from "../../../../api/borehole.ts";

export interface BoreholeGeneralProps {
  borehole: BoreholeV2;
  editingEnabled: boolean;
}

export interface BoreholeDetailProps extends BoreholeGeneralProps {
  formMethods: UseFormReturn<BoreholeFormInputs>;
  updateNumber: (attribute: string, value: number | null, to?: boolean) => void;
  updateChange: (
    attribute: string,
    value: string | number | boolean | null | (number | string | null)[],
    to?: boolean,
  ) => void;
}

export interface BoreholePanelProps extends BoreholeGeneralProps {
  boreholeId: string;
  updateNumber: (attribute: string, value: number | null, to?: boolean) => void;
  updateChange: (
    attribute: string,
    value: string | number | boolean | null | (number | string | null)[],
    to?: boolean,
  ) => void;
  onSubmit: (data: BoreholeFormInputs) => void;
  onDirtyChange: (isDirty: boolean) => void;
}

export interface DepthTVD {
  totalDepth?: number;
  topBedrockFreshMd?: number;
  topBedrockWeatheredMd?: number;
}

export interface BoreholeFormInputs {
  totalDepth: number | null;
  qtDepthId: number;
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

export interface BoreholeFormSubmission extends BoreholeFormInputs {}
