import { createContext, FC, PropsWithChildren, useState } from "react";
import { GridScrollParams } from "@mui/x-data-grid";

interface TableContextInterface {
  bottomDrawerOpen: boolean;
  setBottomDrawerOpen: (bottomDrawerOpen: boolean) => void;
  tableScrollPosition: GridScrollParams;
  setTableScrollPosition: (tableScrollPosition: GridScrollParams) => void;
}

export const TableContext = createContext<TableContextInterface>({
  bottomDrawerOpen: false,
  setBottomDrawerOpen: () => {},
  tableScrollPosition: { top: 0, left: 0 },
  setTableScrollPosition: () => {},
});

export const TableProvider: FC<PropsWithChildren> = ({ children }) => {
  const [bottomDrawerOpen, setBottomDrawerOpen] = useState<boolean>(false);
  const [tableScrollPosition, setTableScrollPosition] = useState<GridScrollParams>({ top: 0, left: 0 });

  return (
    <TableContext.Provider
      value={{
        bottomDrawerOpen,
        setBottomDrawerOpen,
        tableScrollPosition,
        setTableScrollPosition,
      }}>
      {children}
    </TableContext.Provider>
  );
};
