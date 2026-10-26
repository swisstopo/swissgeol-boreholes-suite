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

export interface ExtractionResponse {
  text: string;
  number: number;
  coordinates: Coordinate;
}

export interface StratigraphyExtractionResponse {
  boreholes: {
    id: string;
    page_numbers: number[];
    layers: {
      start: { depth: number | null; bounding_boxes: ExtractionBoundingBox[] } | null;
      end: { depth: number | null; bounding_boxes: ExtractionBoundingBox[] } | null;
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

export type ClassificationConsolidation = "consolidated" | "unconsolidated";

export interface ClassifyVariables {
  description: string;
  signal: AbortSignal;
}

/**
 * The response of POST /dataextraction/api/V1/classify.
 *
 * Every field is optional: the route is declared with `response_model_exclude_none=True`, so an
 * attribute the service could not determine is absent rather than null, and a description it cannot
 * classify at all yields an empty object. Values are the service's enum member names, either code
 * like (`en_main`, `en_secondary`, `uscs`) or snake_case english (everything else).
 */
export interface ClassifyResponse {
  consolidation?: ClassificationConsolidation;
  lithology?: string;
  cementation?: string;
  alteration_degree_consolidated?: string;
  mineral_components?: string[];
  accessory_components?: string[];
  en_main?: string;
  en_secondary?: string[];
  uscs?: string | string[];
  debris?: string[];
  organic_components?: string[];
  grain_angularity?: string[];
  grain_shape?: string[];
  color?: string;
}
