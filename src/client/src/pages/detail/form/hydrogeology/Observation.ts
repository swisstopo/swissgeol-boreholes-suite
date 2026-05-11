import {
  FieldMeasurement,
  GroundwaterLevelMeasurement,
  Hydrotest,
  Observation,
  WaterIngress,
} from "../../../../api/generated";
import { parseFloatWithThousandsSeparator } from "../../../../components/form/formUtils.ts";
import { getIsoDateIfDefined } from "./hydrogeologyFormUtils.ts";

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
  if (data.reliabilityId == null) {
    data.reliabilityId = null;
  }
  delete data.reliability;
  return {
    ...data,
    startTime: getIsoDateIfDefined(data?.startTime ?? null),
    endTime: getIsoDateIfDefined(data?.endTime ?? null),
    fromDepthM: parseFloatWithThousandsSeparator(data?.fromDepthM ?? null),
    toDepthM: parseFloatWithThousandsSeparator(data?.toDepthM ?? null),
    fromDepthMasl: parseFloatWithThousandsSeparator(data?.fromDepthMasl ?? null),
    toDepthMasl: parseFloatWithThousandsSeparator(data?.toDepthMasl ?? null),
    boreholeId: parentId,
  } as T;
}
