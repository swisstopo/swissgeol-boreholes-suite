import { createContext, FC, PropsWithChildren, useCallback, useContext, useEffect, useState } from "react";
import { ExtractionObject, ExtractionState, PanelPosition, PanelTab } from "../../../api/dataextractionInterfaces.ts";

interface LabelingContextInterface {
  panelPosition: PanelPosition;
  setPanelPosition: (position: PanelPosition) => void;
  panelOpen: boolean;
  togglePanel: (isOpen?: boolean) => void;
  extractionObject?: ExtractionObject;
  setExtractionObject: (extractionObject: ExtractionObject | undefined) => void;
  extractionState?: ExtractionState;
  setExtractionState: (extractionState: ExtractionState) => void;
  setAbortController: (abortController: AbortController | undefined) => void;
  cancelRequest: () => void;
  panelTab: PanelTab;
  setPanelTab: (panelTab: PanelTab) => void;
}

export const LabelingContext = createContext<LabelingContextInterface>({
  panelPosition: "right",
  setPanelPosition: () => {},
  panelOpen: false,
  togglePanel: () => {},
  extractionObject: undefined,
  setExtractionObject: () => {},
  extractionState: undefined,
  setExtractionState: () => {},
  setAbortController: () => {},
  cancelRequest: () => {},
  panelTab: PanelTab.profile,
  setPanelTab: () => {},
});

const panelPositionStorageName = "labelingPanelPosition";

export const LabelingProvider: FC<PropsWithChildren> = ({ children }) => {
  const [panelPosition, setPanelPosition] = useState<PanelPosition>(
    () => (localStorage.getItem(panelPositionStorageName) as PanelPosition | null) || "right",
  );
  const [panelOpen, setPanelOpen] = useState(false);
  const [extractionObject, setExtractionObjectState] = useState<ExtractionObject>();
  const [extractionState, setExtractionState] = useState<ExtractionState>();
  const [abortController, setAbortController] = useState<AbortController>();
  const [panelTab, setPanelTab] = useState<PanelTab>(PanelTab.profile);

  // Closing the panel discards the extraction in progress.
  const togglePanel = useCallback(
    (isOpen?: boolean) => {
      const nextPanelOpen = isOpen ?? !panelOpen;
      setPanelOpen(nextPanelOpen);
      if (!nextPanelOpen) {
        setExtractionObjectState(undefined);
        setExtractionState(undefined);
      }
    },
    [panelOpen],
  );

  // An extraction is shown in the panel, so starting one opens it.
  const setExtractionObject = useCallback((newExtractionObject: ExtractionObject | undefined) => {
    setExtractionObjectState(newExtractionObject);
    if (newExtractionObject) {
      setPanelOpen(true);
    }
  }, []);

  const cancelRequest = useCallback(() => {
    if (abortController) {
      abortController.abort();
      setAbortController(undefined);
    }
    setExtractionObject({ type: "coordinates" });
    setExtractionState(ExtractionState.start);
  }, [abortController, setExtractionObject]);

  useEffect(() => {
    localStorage.setItem(panelPositionStorageName, panelPosition);
  }, [panelPosition]);

  return (
    <LabelingContext.Provider
      value={{
        panelPosition,
        setPanelPosition,
        panelOpen,
        togglePanel,
        extractionObject,
        setExtractionObject,
        extractionState,
        setExtractionState,
        setAbortController,
        cancelRequest,
        panelTab,
        setPanelTab,
      }}>
      {children}
    </LabelingContext.Provider>
  );
};

export const useLabelingContext = () => useContext(LabelingContext);
