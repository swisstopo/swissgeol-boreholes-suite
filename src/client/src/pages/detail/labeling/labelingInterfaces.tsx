import { LabelingContext } from "./labelingContext.tsx";
import { useContext } from "react";

export interface LabelingContextInterface {
  panelPosition: "right" | "bottom";
  panelOpen: boolean;
  togglePanel: () => void;
}

export const useLabelingContext = () => useContext(LabelingContext);
