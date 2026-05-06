import { ReferenceSystemKey } from "../pages/detail/form/location/coordinateSegmentInterfaces.ts";

export type ExtractionType = "text" | "number" | "coordinates";
export enum ExtractionState {
  start,
  drawing,
  loading,
  success,
  error,
}

export interface ExtractionObject {
  type?: ExtractionType;
  value?: string | number | Coordinate;
  previousValue?: string | number | Coordinate | null;
}

export interface ExtractionBoundingBox {
  x0: number;
  y0: number;
  x1: number;
  y1: number;
  page_number?: number;
}

export interface ExtractionRequest {
  filename: string;
  page_number: number;
  bbox: ExtractionBoundingBox;
  format: ExtractionType;
}

export interface DataExtractionResponse {
  fileName: string;
  width: number;
  height: number;
  count: number;
}

export interface Coordinate {
  east: number | string;
  north: number | string;
  projection: ReferenceSystemKey;
}
export interface BoundingBoxResponse {
  bounding_boxes: ExtractionBoundingBox[];
}

export type ExtractionResponse = {
  [key in ExtractionType]: string | number | Coordinate;
};

export interface StratigraphyExtractionResponse {
  boreholes: {
    id: string;
    page_numbers: number[];
    layers: {
      start: { depth: number; bounding_boxes: ExtractionBoundingBox[] };
      end: { depth: number; bounding_boxes: ExtractionBoundingBox[] };
      material_description: { text: string; bounding_boxes: ExtractionBoundingBox[] };
    }[];
  }[];
}

export type PanelPosition = "right" | "bottom";

export enum PanelTab {
  profile = "profile",
  photo = "photo",
}

export const labelingFileFormat: Record<PanelTab, string> = {
  [PanelTab.profile]: "application/pdf",
  [PanelTab.photo]: "image/*",
};

export const matchesFileFormat = (expectedFormat: string, format: string) => {
  if (expectedFormat.endsWith("*")) {
    return format.startsWith(expectedFormat.slice(0, -1));
  }
  return format === expectedFormat;
};
