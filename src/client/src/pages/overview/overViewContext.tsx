import { createContext, FC, PropsWithChildren, useState } from "react";
import { GridScrollParams } from "@mui/x-data-grid";

interface OverviewContextInterface {
  bottomDrawerOpen: boolean;
  setBottomDrawerOpen: (bottomDrawerOpen: boolean) => void;
  tableScrollPosition: GridScrollParams;
  setTableScrollPosition: (tableScrollPosition: GridScrollParams) => void;
  mapResolution: number;
  setMapResolution: (mapResolution: number) => void;
  mapCenter: [number, number] | null;
  setMapCenter: (mapCenter: [number, number] | null) => void;
}

export const OverViewContext = createContext<OverviewContextInterface>({
  bottomDrawerOpen: false,
  setBottomDrawerOpen: () => {},
  tableScrollPosition: { top: 0, left: 0 },
  setTableScrollPosition: () => {},
  mapResolution: 500,
  setMapResolution: () => {},
  mapCenter: null,
  setMapCenter: () => {},
});

export const OverviewProvider: FC<PropsWithChildren> = ({ children }) => {
  const [bottomDrawerOpen, setBottomDrawerOpen] = useState<boolean>(false);
  const [tableScrollPosition, setTableScrollPosition] = useState<GridScrollParams>({ top: 0, left: 0 });
  const [mapResolution, setMapResolution] = useState<number>(500);
  const [mapCenter, setMapCenter] = useState<[number, number] | null>(null);

  return (
    <OverViewContext.Provider
      value={{
        bottomDrawerOpen,
        setBottomDrawerOpen,
        tableScrollPosition,
        setTableScrollPosition,
        mapResolution,
        setMapResolution,
        mapCenter,
        setMapCenter,
      }}>
      {children}
    </OverViewContext.Provider>
  );
};
