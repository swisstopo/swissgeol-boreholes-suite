import { LabelingContextInterface } from "./labelingInterfaces.tsx";
import { createContext, FC, PropsWithChildren, useState } from "react";

export const LabelingContext = createContext<LabelingContextInterface>({
  panelPosition: "right",
  panelOpen: false,
  togglePanel: () => {},
});

export const LabelingProvider: FC<PropsWithChildren> = ({ children }) => {
  const [panelPosition, setPanelPosition] = useState<"right" | "bottom">("bottom");
  const [panelOpen, setPanelOpen] = useState(false);

  const togglePanel = () => {
    setPanelOpen(!panelOpen);
  };

  return (
    <LabelingContext.Provider
      value={{
        panelPosition,
        panelOpen,
        togglePanel,
      }}>
      {children}
    </LabelingContext.Provider>
  );
};
