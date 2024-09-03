import { LabelingContextInterface } from "./labelingInterfaces.tsx";
import { createContext, FC, PropsWithChildren, useState } from "react";

export const LabelingContext = createContext<LabelingContextInterface>({
  panelPosition: "right",
  panelOpen: false,
  togglePanel: () => {},
});

export const LabelingProvider: FC<PropsWithChildren> = ({ children }) => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars -- This will be used later
  const [panelPosition, setPanelPosition] = useState<"right" | "bottom">("right");
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
