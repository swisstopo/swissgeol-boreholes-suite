import { Borehole } from "../../../../api-lib/ReduxStateInterfaces.ts";
import { SegmentProps } from "./segmentInterface.ts";

export enum ReferenceSystemCode {
  LV95 = 20104001,
  LV03 = 20104002,
}

export enum ReferenceSystemKey {
  LV95 = "LV95",
  LV03 = "LV03",
}

export enum FieldNameDirectionKeys {
  location_x = "location_x",
  location_y = "location_y",
  location_x_lv03 = "location_x_lv03",
  location_y_lv03 = "location_y_lv03",
}

export enum Direction {
  X = "X",
  Y = "Y",
}
export interface FieldNameDirections {
  X: FieldNameDirectionKeys;
  Y: FieldNameDirectionKeys;
}

export interface ReferenceSystem {
  code: ReferenceSystemCode;
  name: string;
  fieldName: FieldNameDirections;
}

export interface CoordinateLimit {
  Min: number;
  Max: number;
}

export interface DirectionLimits {
  X: CoordinateLimit;
  Y: CoordinateLimit;
}

export interface CoordinateLimits {
  LV95: DirectionLimits;
  LV03: DirectionLimits;
}

export interface CoordinatePrecisions {
  LV95: { x: number; y: number };
  LV03: { x: number; y: number };
}

export interface Coordinates {
  LV95: { x: number | null; y: number | null };
  LV03: { x: number | null; y: number | null };
}

export interface FormValues {
  spatial_reference_system: number;
  location_x: string;
  location_y: string;
  location_x_lv03: string;
  location_y_lv03: string;
  location_precision: string;
}

export interface CoordinatesSegmentProps extends SegmentProps {
  updateNumber: (fieldName: keyof Borehole["data"], value: number | null) => void;
  mapPointChange: boolean;
  setMapPointChange: React.Dispatch<React.SetStateAction<boolean>>;
}

export interface Location {
  country: string;
  canton: string;
  municipality: string;
}
