import { LabelingContext } from "./labelingContext.tsx";
import { useContext } from "react";

export type PanelPosition = "right" | "bottom";

export interface LabelingContextInterface {
  panelPosition: PanelPosition;
  setPanelPosition: (position: PanelPosition) => void;
  panelOpen: boolean;
  togglePanel: () => void;
}

export const useLabelingContext = () => useContext(LabelingContext);
