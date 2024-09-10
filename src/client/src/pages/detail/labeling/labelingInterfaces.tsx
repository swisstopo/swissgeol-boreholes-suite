import { LabelingContext } from "./labelingContext.tsx";
import { useContext } from "react";

export type PanelPosition = "right" | "bottom";

export interface LabelingContextInterface {
  panelPosition: PanelPosition;
  setPanelPosition: (position: PanelPosition) => void;
  panelOpen: boolean;
  togglePanel: (isOpen?: boolean) => void;
}

export const labelingFileFormat = "application/pdf";

export const useLabelingContext = () => useContext(LabelingContext);
