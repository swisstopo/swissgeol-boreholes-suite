export interface Observation {
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
}

export interface ObservationInputProps {
  observation: Observation;
  boreholeId: number;
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
  isEditable: boolean;
}

export interface GwlmFormData {
  casingId: number | null;
  boreholeId: number;
  type: number;
  endTime: string | null;
  startTime: string | null;
  reliabilityId: number | string | null;
  reliability?: object;
}
