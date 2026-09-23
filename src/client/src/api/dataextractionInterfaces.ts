import { ReferenceSystemKey } from "../pages/detail/form/location/coordinateSegmentInterfaces.ts";
import { getLargeMaxFileSize, getMaxFileSize } from "./fileSize.ts";

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

/**
 * The largest file a tab accepts, in bytes.
 *
 * A profile is sent in chunks, so it is held to what the resumable upload accepts. A photo still
 * travels in a single request and is held to what that one accepts, so that an oversized photo is
 * refused before its bytes are sent rather than by the server once they have arrived.
 *
 * Read when a file is picked rather than kept in a table, because the limits only exist once the
 * application settings have been read.
 * @param tab The tab the file was picked on.
 * @returns The limit that applies, in bytes.
 */
export const maxFileSizeForTab = (tab: PanelTab): number =>
  tab === PanelTab.profile ? getLargeMaxFileSize() : getMaxFileSize();

export const matchesFileFormat = (expectedFormat: string, format: string) => {
  if (expectedFormat.endsWith("*")) {
    return format.startsWith(expectedFormat.slice(0, -1));
  }
  return format === expectedFormat;
};
