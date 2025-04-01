import { createContext, FC, PropsWithChildren, useMemo, useState } from "react";
import { GridSortModel } from "@mui/x-data-grid";

export interface WorkgroupAdministrationContextProps {
  workgroupTableSortModel: GridSortModel;
  setworkgroupTableSortModel: (model: GridSortModel) => void;
  workgroupDetailTableSortModel: GridSortModel;
  setWorkgroupDetailTableSortModel: (model: GridSortModel) => void;
}

export const WorkgroupAdministrationContext = createContext<WorkgroupAdministrationContextProps>({
  workgroupTableSortModel: [],
  setworkgroupTableSortModel: () => {},
  workgroupDetailTableSortModel: [],
  setWorkgroupDetailTableSortModel: () => {},
});

export const WorkgroupAdministrationProvider: FC<PropsWithChildren> = ({ children }) => {
  const [workgroupTableSortModel, setworkgroupTableSortModel] = useState<GridSortModel>([
    { field: "name", sort: "asc" },
  ]);
  const [workgroupDetailTableSortModel, setWorkgroupDetailTableSortModel] = useState<GridSortModel>([
    { field: "lastName", sort: "asc" },
  ]);
  return (
    <WorkgroupAdministrationContext.Provider
      value={useMemo(
        () => ({
          workgroupTableSortModel,
          setworkgroupTableSortModel,
          workgroupDetailTableSortModel,
          setWorkgroupDetailTableSortModel,
        }),
        [workgroupTableSortModel, workgroupDetailTableSortModel],
      )}>
      {children}
    </WorkgroupAdministrationContext.Provider>
  );
};
