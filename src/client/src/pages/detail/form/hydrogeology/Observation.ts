import { Codelist } from "../../../../components/legacyComponents/domain/domainInterface.ts";

export enum ObservationDepthUnitType {
  measuredDepth = 0,
  masl = 1,
}
export enum ObservationType {
  waterIngress = 1,
  groundwaterLevelMeasurement = 2,
  hydrotest = 3,
  fieldMeasurement = 4,
}

export interface Observation {
  boreholeId: number;
  comment: string;
  casingId: number;
  isOpenBorehole: boolean;
  endTime: string;
  startTime: string;
  toDepthMasl: number;
  fromDepthMasl: number;
  toDepthM: number;
  fromDepthM: number;
  reliabilityId: number | null;
  reliability: string; // domain name
  type: ObservationType;
}

export interface ObservationInputProps {
  observation: Observation;
  showDepthInputs?: boolean;
}

export interface GroundwaterLevelMeasurement extends Observation {
  levelM: string;
  levelMasl: string;
  kindId: number;
  kind: string; // domain name
}

export interface GroundwaterLevelMeasurementInputProps {
  item: GroundwaterLevelMeasurement;
  parentId: number;
}

export interface GroundwaterLevelMeasurementDisplayProps {
  item: GroundwaterLevelMeasurement;
}

export interface GwlmFormData {
  casingId: number | null;
  boreholeId: number;
  type: number;
  endTime: string | null;
  startTime: string | null;
  reliabilityId: number | string | null;
  reliability?: Codelist;
}

export interface WaterIngressFormData {
  reliabilityId: string | null;
  reliability?: Codelist;
  conditionsId: string | null;
  conditions?: Codelist;
  type: ObservationType;
  startTime: string | null;
  endTime: string | null;
  boreholeId: number;
}

export interface WaterIngress extends Observation {
  quantityId: number;
  quantity: Codelist;
  conditionsId: number | null;
  conditions: Codelist;
}
