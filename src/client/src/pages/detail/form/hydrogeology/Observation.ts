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
  id?: number;
  boreholeId: number;
  comment: string;
  casingId: number;
  isOpenBorehole: boolean;
  endTime: string | null;
  startTime: string | null;
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
