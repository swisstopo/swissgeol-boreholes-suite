import { createContext, FC, PropsWithChildren, useCallback, useEffect, useLayoutEffect, useState } from "react";
import { ExtractionObject, ExtractionState, LabelingContextInterface, PanelPosition } from "./labelingInterfaces.tsx";

export const LabelingContext = createContext<LabelingContextInterface>({
  panelPosition: "right",
  setPanelPosition: () => {},
  panelOpen: false,
  togglePanel: () => {},
  extractionObject: undefined,
  setExtractionObject: () => {},
  extractionState: undefined,
  setExtractionState: () => {},
});

export const LabelingProvider: FC<PropsWithChildren> = ({ children }) => {
  const [panelPosition, setPanelPosition] = useState<PanelPosition>("right");
  const [panelOpen, setPanelOpen] = useState(false);
  const [extractionObject, setExtractionObject] = useState<ExtractionObject>();
  const [extractionState, setExtractionState] = useState<ExtractionState>();

  const togglePanel = useCallback((isOpen?: boolean) => {
    setPanelOpen(prevState => (isOpen !== undefined ? isOpen : !prevState));
  }, []);

  const panelPositionStorageName = "labelingPanelPosition";
  useLayoutEffect(() => {
    const storedPosition = localStorage.getItem(panelPositionStorageName) as PanelPosition;
    if (storedPosition) {
      setPanelPosition(storedPosition);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(panelPositionStorageName, panelPosition);
  }, [panelPosition]);

  useEffect(() => {
    if (extractionObject) {
      togglePanel(true);
    }
  }, [extractionObject, togglePanel]);

  useEffect(() => {
    if (!panelOpen) {
      setExtractionObject(undefined);
    }
  }, [panelOpen]);

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
      }}>
      {children}
    </LabelingContext.Provider>
  );
};
