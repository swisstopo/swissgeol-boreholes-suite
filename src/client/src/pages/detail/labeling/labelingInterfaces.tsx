import { LabelingContext } from "./labelingContext.tsx";
import { useContext } from "react";

// TODO: Extend with other types
export type ExtractionType = "coordinate";

export interface ExtractionObject {
  type: ExtractionType;
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

export type PanelPosition = "right" | "bottom";

export interface LabelingContextInterface {
  panelPosition: PanelPosition;
  setPanelPosition: (position: PanelPosition) => void;
  panelOpen: boolean;
  togglePanel: (isOpen?: boolean) => void;
  extractionObject?: ExtractionObject;
  setExtractionObject: (extractionObject: ExtractionObject) => void;
}

export const labelingFileFormat = "application/pdf";

export const useLabelingContext = () => useContext(LabelingContext);
