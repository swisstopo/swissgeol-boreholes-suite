import { useContext } from "react";
import { ReferenceSystemKey } from "../form/location/coordinateSegmentInterfaces.ts";
import { LabelingContext } from "./labelingContext.tsx";

export type ExtractionType = "text" | "number" | "coordinates";
export enum ExtractionState {
  start,
  drawing,
  loading,
  success,
  error,
}

export interface ExtractionObject {
  state: ExtractionState;
  type?: ExtractionType;
  value?: string | number | Coordinate;
  previousValue?: string | number | Coordinate | null;
}

export interface ExtractionBoundingBox {
  x0: number;
  y0: number;
  x1: number;
  y1: number;
}

export interface ExtractionRequest {
  filename: string;
  page_number: number;
  bbox: ExtractionBoundingBox;
  format: ExtractionType;
}

export interface Coordinate {
  east: number | string;
  north: number | string;
  projection: ReferenceSystemKey;
}

export type ExtractionResponse = {
  [key in ExtractionType]: string | number | Coordinate;
};

export type PanelPosition = "right" | "bottom";

export interface LabelingContextInterface {
  panelPosition: PanelPosition;
  setPanelPosition: (position: PanelPosition) => void;
  panelOpen: boolean;
  togglePanel: (isOpen?: boolean) => void;
  extractionObject?: ExtractionObject;
  setExtractionObject: (extractionObject: ExtractionObject | undefined) => void;
}

export const labelingFileFormat = "application/pdf";

export const useLabelingContext = () => useContext(LabelingContext);
