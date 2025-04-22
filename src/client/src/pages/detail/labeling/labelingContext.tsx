import {
  createContext,
  FC,
  PropsWithChildren,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useState,
} from "react";
import { DataExtractionResponse } from "../../../api/file/fileInterfaces.ts";
import {
  ExtractionObject,
  ExtractionState,
  LabelingContextInterface,
  PanelPosition,
  PanelTab,
} from "./labelingInterfaces.tsx";

export const LabelingContext = createContext<LabelingContextInterface>({
  panelPosition: "right",
  setPanelPosition: () => {},
  panelOpen: false,
  togglePanel: () => {},
  extractionObject: undefined,
  setExtractionObject: () => {},
  extractionState: undefined,
  setExtractionState: () => {},
  fileInfo: undefined,
  setFileInfo: () => {},
  setAbortController: () => {},
  cancelRequest: () => {},
  panelTab: PanelTab.profile,
  setPanelTab: () => {},
});

export const LabelingProvider: FC<PropsWithChildren> = ({ children }) => {
  const [panelPosition, setPanelPosition] = useState<PanelPosition>("right");
  const [panelOpen, setPanelOpen] = useState(false);
  const [extractionObject, setExtractionObject] = useState<ExtractionObject>();
  const [extractionState, setExtractionState] = useState<ExtractionState>();
  const [fileInfo, setFileInfo] = useState<DataExtractionResponse>();
  const [abortController, setAbortController] = useState<AbortController>();
  const [panelTab, setPanelTab] = useState<PanelTab>(PanelTab.profile);

  const togglePanel = useCallback((isOpen?: boolean) => {
    setPanelOpen(prevState => (isOpen !== undefined ? isOpen : !prevState));
  }, []);

  const cancelRequest = useCallback(() => {
    if (abortController) {
      abortController.abort();
      setAbortController(undefined);
    }
    setExtractionObject({ type: "coordinates" });
    setExtractionState(ExtractionState.start);
  }, [abortController]);

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
      setExtractionState(undefined);
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
        fileInfo,
        setFileInfo,
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
