import { LabelingContext } from "./labelingContext.tsx";
import { useContext } from "react";

export interface LabelingContextInterface {
  panelPosition: "right" | "bottom";
  setPanelPosition: (position: "right" | "bottom") => void;
  panelOpen: boolean;
  togglePanel: () => void;
}

export const useLabelingContext = () => useContext(LabelingContext);
