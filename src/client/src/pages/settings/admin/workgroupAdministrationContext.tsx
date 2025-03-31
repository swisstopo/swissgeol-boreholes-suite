import { createContext, FC, PropsWithChildren, useMemo, useState } from "react";
import { GridSortModel } from "@mui/x-data-grid";
import { Workgroup } from "../../../api/apiInterfaces.ts";

export interface WorkgroupAdministrationContextProps {
  selectedWorkgroup: Workgroup | null;
  setSelectedWorkgroup: (workgroup: Workgroup | null) => void;
  workgroupTableSortModel: GridSortModel;
  setworkgroupTableSortModel: (model: GridSortModel) => void;
  workgroupDetailTableSortModel: GridSortModel;
  setWorkgroupDetailTableSortModel: (model: GridSortModel) => void;
}

export const WorkgroupAdministrationContext = createContext<WorkgroupAdministrationContextProps>({
  selectedWorkgroup: null,
  setSelectedWorkgroup: () => {},
  workgroupTableSortModel: [],
  setworkgroupTableSortModel: () => {},
  workgroupDetailTableSortModel: [],
  setWorkgroupDetailTableSortModel: () => {},
});

export const WorkgroupAdministrationProvider: FC<PropsWithChildren> = ({ children }) => {
  const [selectedWorkgroup, setSelectedWorkgroup] = useState<Workgroup | null>(null);
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
          selectedWorkgroup,
          setSelectedWorkgroup,
          workgroupTableSortModel,
          setworkgroupTableSortModel,
          workgroupDetailTableSortModel,
          setWorkgroupDetailTableSortModel,
        }),
        [selectedWorkgroup, workgroupTableSortModel, workgroupDetailTableSortModel],
      )}>
      {children}
    </WorkgroupAdministrationContext.Provider>
  );
};
