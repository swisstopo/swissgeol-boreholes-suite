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
}

export const WorkgroupAdministrationContext = createContext<WorkgroupAdministrationContextProps>({
  workgroups: [],
  setWorkgroups: () => {},
  selectedWorkgroup: null,
  setSelectedWorkgroup: () => {},
  workgroupTableSortModel: [],
  setworkgroupTableSortModel: () => {},
});

export const WorkgroupAdministrationProvider: FC<PropsWithChildren> = ({ children }) => {
  const [workgroups, setWorkgroups] = useState<Workgroup[]>([]);
  const [selectedWorkgroup, setSelectedWorkgroup] = useState<Workgroup | null>(null);
  const [workgroupTableSortModel, setworkgroupTableSortModel] = useState<GridSortModel>([]);
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
        }),
        [workgroups, selectedWorkgroup, workgroupTableSortModel],
      )}>
      {children}
    </WorkgroupAdministrationContext.Provider>
  );
};
