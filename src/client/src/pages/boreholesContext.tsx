import { createContext, FC, ReactNode, useState } from "react";

import { GridPaginationModel, GridRowSelectionModel, GridSortModel } from "@mui/x-data-grid";
import { Borehole } from "../api-lib/ReduxStateInterfaces.ts";

export interface BoreholesContextInterface {
  isFetching: boolean;
  setIsFetching: (isFetching: boolean) => void;
  boreholeCount: number;
  setBoreholeCount: (boreholeCount: number) => void;
  paginationModel: GridPaginationModel;
  setPaginationModel: (paginationModel: GridPaginationModel) => void;
  sortModel: GridSortModel;
  setSortModel: (sortModel: GridSortModel) => void;
  selectionModel: GridRowSelectionModel;
  setSelectionModel: (selectionModel: GridRowSelectionModel) => void;
  loadedBoreholes: Borehole[];
  setLoadedBoreholes: (boreholes: Borehole[]) => void;
}

export interface BoreholesProviderProps {
  children: ReactNode;
}

export const BoreholesContext = createContext<BoreholesContextInterface>({
  isFetching: true,
  setIsFetching: () => {},
  boreholeCount: 0,
  setBoreholeCount: () => {},
  paginationModel: { page: 0, pageSize: 50 },
  setPaginationModel: () => {},
  sortModel: [{ field: "alternate_name", sort: "asc" }],
  setSortModel: () => {},
  selectionModel: [],
  setSelectionModel: () => {},
  loadedBoreholes: [],
  setLoadedBoreholes: () => {},
});

export const BoreholesProvider: FC<BoreholesProviderProps> = ({ children }) => {
  const [isFetching, setIsFetching] = useState(true);
  const [boreholeCount, setBoreholeCount] = useState(0);
  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({ page: 0, pageSize: 50 });
  const [sortModel, setSortModel] = useState<GridSortModel>([{ field: "alternate_name", sort: "asc" }]);
  const [selectionModel, setSelectionModel] = useState<GridRowSelectionModel>([]);
  const [loadedBoreholes, setLoadedBoreholes] = useState<Borehole[]>([]);

  return (
    <BoreholesContext.Provider
      value={{
        isFetching,
        setIsFetching,
        boreholeCount,
        setBoreholeCount,
        paginationModel,
        setPaginationModel,
        sortModel,
        setSortModel,
        selectionModel,
        setSelectionModel,
        loadedBoreholes,
        setLoadedBoreholes,
      }}>
      {children}
    </BoreholesContext.Provider>
  );
};
