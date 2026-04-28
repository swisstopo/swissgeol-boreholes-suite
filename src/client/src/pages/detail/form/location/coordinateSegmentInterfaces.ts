import { UseFormReturn } from "react-hook-form";
import { LocationBaseProps, LocationFormInputs } from "./locationPanelInterfaces.tsx";

export enum ReferenceSystemCode {
  LV95 = 20104001,
  LV03 = 20104002,
}

export enum ReferenceSystemKey {
  LV95 = "LV95",
  LV03 = "LV03",
}

export enum FieldNameDirectionKeys {
  locationX = "locationX",
  locationY = "locationY",
  locationXLV03 = "locationXLV03",
  locationYLV03 = "locationYLV03",
}

export enum Direction {
  X = "X",
  Y = "Y",
}
interface FieldNameDirections {
  X: FieldNameDirectionKeys;
  Y: FieldNameDirectionKeys;
}

export interface ReferenceSystem {
  code: ReferenceSystemCode;
  name: string;
  fieldName: FieldNameDirections;
}

interface CoordinateLimit {
  Min: number;
  Max: number;
}

interface DirectionLimits {
  X: CoordinateLimit;
  Y: CoordinateLimit;
}

export interface CoordinateLimits {
  LV95: DirectionLimits;
  LV03: DirectionLimits;
}

export interface Coordinates {
  LV95: { x: number | null; y: number | null };
  LV03: { x: number | null; y: number | null };
}

export interface CoordinatesSegmentProps extends LocationBaseProps {
  formMethods: UseFormReturn<LocationFormInputs>;
  setValuesForReferenceSystem: (referenceSystem: string, X: string, Y: string) => void;
  setValuesForCountryCantonMunicipality: (location: Location) => void;
  handleCoordinateTransformation: (
    sourceSystem: ReferenceSystemKey,
    targetSystem: ReferenceSystemKey,
    X: number,
    Y: number,
    XPrecision: number,
    YPrecision: number,
  ) => Promise<void>;
}

export interface Location {
  country: string;
  canton: string;
  municipality: string;
}
