import { LabelingContextInterface, PanelPosition } from "./labelingInterfaces.tsx";
import { createContext, FC, PropsWithChildren, useEffect, useLayoutEffect, useState } from "react";

export const LabelingContext = createContext<LabelingContextInterface>({
  panelPosition: "right",
  setPanelPosition: () => {},
  panelOpen: false,
  togglePanel: () => {},
});

export const LabelingProvider: FC<PropsWithChildren> = ({ children }) => {
  const [panelPosition, setPanelPosition] = useState<PanelPosition>("right");
  const [panelOpen, setPanelOpen] = useState(false);

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

  const togglePanel = () => {
    setPanelOpen(!panelOpen);
  };

  return (
    <LabelingContext.Provider
      value={{
        panelPosition,
        setPanelPosition,
        panelOpen,
        togglePanel,
      }}>
      {children}
    </LabelingContext.Provider>
  );
};
