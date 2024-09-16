import { LabelingContext } from "./labelingContext.tsx";
import { useContext } from "react";

// TODO: Extend with other types
export type ExtractionType = "coordinate";

export interface ExtractionObject {
  type: ExtractionType;
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
