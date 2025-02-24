import { createContext, FC, PropsWithChildren, useMemo, useState } from "react";
import { GridSortModel } from "@mui/x-data-grid";
import { Workgroup } from "../../../api/apiInterfaces.ts";

export interface WorkgroupAdministrationContextProps {
  workgroups: Workgroup[];
  setWorkgroups: (workgroups: Workgroup[]) => void;
  selectedWorkgroup: Workgroup | null;
  setSelectedWorkgroup: (workgroup: Workgroup | null) => void;
  workgroupTableSortModel: GridSortModel;
  setworkgroupTableSortModel: (model: GridSortModel) => void;
  workgroupDetailTableSortModel: GridSortModel;
  setWorkgroupDetailTableSortModel: (model: GridSortModel) => void;
}

export const WorkgroupAdministrationContext = createContext<WorkgroupAdministrationContextProps>({
  workgroups: [],
  setWorkgroups: () => {},
  selectedWorkgroup: null,
  setSelectedWorkgroup: () => {},
  workgroupTableSortModel: [],
  setworkgroupTableSortModel: () => {},
  workgroupDetailTableSortModel: [],
  setWorkgroupDetailTableSortModel: () => {},
});

export const WorkgroupAdministrationProvider: FC<PropsWithChildren> = ({ children }) => {
  const [workgroups, setWorkgroups] = useState<Workgroup[]>([]);
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
          workgroups,
          setWorkgroups,
          selectedWorkgroup,
          setSelectedWorkgroup,
          workgroupTableSortModel,
          setworkgroupTableSortModel,
          workgroupDetailTableSortModel,
          setWorkgroupDetailTableSortModel,
        }),
        [workgroups, selectedWorkgroup, workgroupTableSortModel, workgroupDetailTableSortModel],
      )}>
      {children}
    </WorkgroupAdministrationContext.Provider>
  );
};
