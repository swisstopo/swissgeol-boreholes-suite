import { BoreholeV2 } from "../../../../api/borehole.ts";

export interface BoreholeGeneralProps {
  borehole: BoreholeV2;
  updateChange: (
    attribute: string,
    value: string | number | boolean | null | (number | string | null)[],
    to?: boolean,
  ) => void;
  isEditable: boolean;
}

export interface BoreholeDetailProps extends BoreholeGeneralProps {
  updateNumber: (attribute: string, value: number | null, to?: boolean) => void;
}

export interface BoreholePanelProps extends BoreholeGeneralProps {
  boreholeId: string;
  updateNumber: (attribute: string, value: number | null, to?: boolean) => void;
  onSubmit: (data: BoreholeFormInputs) => void;
  onDirtyChange: (isDirty: boolean) => void;
}

export interface DepthTVD {
  total_depth?: number;
  "extended.top_bedrock_fresh_md"?: number;
  "custom.top_bedrock_weathered_md"?: number;
}

export interface BoreholeFormInputs {}
