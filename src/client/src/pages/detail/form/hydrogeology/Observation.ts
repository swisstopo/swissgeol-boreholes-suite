import { parseFloatWithThousandsSeparator } from "../../../../components/form/formUtils.ts";
import { FieldMeasurement } from "./fieldMeasurement/FieldMeasurement.ts";
import { GroundwaterLevelMeasurement } from "./groundwaterLevelMeasurement/GroundwaterLevelMeasurement.ts";
import { getIsoDateIfDefined } from "./hydrogeologyFormUtils.ts";
import { Hydrotest } from "./hydrotest/Hydrotest.ts";
import { WaterIngress } from "./waterIngress/WaterIngress.ts";

export enum ObservationDepthUnitType {
  unknown = 0,
  measuredDepth = 1,
  masl = 2,
}

export enum ObservationType {
  waterIngress = 1,
  groundwaterLevelMeasurement = 2,
  hydrotest = 3,
  fieldMeasurement = 4,
}

export interface Observation {
  id?: number;
  boreholeId: number;
  comment: string;
  casingId: number;
  isOpenBorehole: boolean;
  endTime: string | null;
  startTime: string | null;
  originalVerticalReferenceSystem: ObservationDepthUnitType;
  toDepthMasl: number | null;
  fromDepthMasl: number | null;
  toDepthM: number | null;
  fromDepthM: number | null;
  reliabilityId: string | number | null;
  reliability?: string; // domain name
  type: ObservationType;
}

export interface ObservationInputProps {
  observation: Observation;
  showDepthInputs?: boolean;
}

export interface DepthInputProps {
  observation: Observation;
  depthFields: Array<{
    fieldNameMD: string;
    labelMD: string;
    getValueMD: () => number | null; // function to get the Measured Depth from the observation
    fieldNameMasl: string;
    labelMasl: string;
    getValueMasl: () => number | null; // function to get the Meters above sea level Depth from the observation
  }>;
}

export function prepareObservationDataForSubmit<
  T extends FieldMeasurement | WaterIngress | GroundwaterLevelMeasurement | Hydrotest,
>(data: T, parentId: number): T {
  if (data.reliabilityId === "") {
    data.reliabilityId = null;
  }
  delete data.reliability;
  return {
    ...data,
    startTime: getIsoDateIfDefined(data?.startTime),
    endTime: getIsoDateIfDefined(data?.endTime),
    fromDepthM: parseFloatWithThousandsSeparator(data?.fromDepthM),
    toDepthM: parseFloatWithThousandsSeparator(data?.toDepthM),
    fromDepthMasl: parseFloatWithThousandsSeparator(data?.fromDepthMasl),
    toDepthMasl: parseFloatWithThousandsSeparator(data?.toDepthMasl),
    boreholeId: parentId,
  } as T;
}
