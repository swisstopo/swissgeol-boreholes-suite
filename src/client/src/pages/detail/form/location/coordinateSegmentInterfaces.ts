import React from "react";
import { UseFormReturn } from "react-hook-form";
import { BoreholeV2 } from "../../../../api/borehole.ts";
import { LocationFormInputs } from "./locationPanel.tsx";

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
  locationX: string;
  locationY: string;
  locationXLV03: string;
  locationYLV03: string;
  location_precision: string;
}

export interface CoordinatesSegmentProps {
  borehole: BoreholeV2;
  editingEnabled: boolean;
  mapPointChange: boolean;
  setMapPointChange: React.Dispatch<React.SetStateAction<boolean>>;
  formMethods: UseFormReturn<LocationFormInputs>;
}

export interface Location {
  country: string;
  canton: string;
  municipality: string;
}
