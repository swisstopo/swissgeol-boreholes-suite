import { LabelingContext } from "./labelingContext.tsx";
import { useContext } from "react";

// TODO: Extend with other types
export type ExtractionType = "coordinate";
export type ExtractionState = "start" | "drawing" | "loading" | "success" | "error";

export interface ExtractionObject {
  type: ExtractionType;
  state: ExtractionState;
  result?: ExtractionResponse;
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
  bounding_box: ExtractionBoundingBox;
}

export interface Coordinate {
  east: number;
  north: number;
  projection: "lv03" | "lv95";
}

export interface ExtractionResponse {
  value: string | number | Coordinate | null;
  bbox: ExtractionBoundingBox;
}

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
