import { createContext, FC, PropsWithChildren, useMemo, useState } from "react";
import { GridSortModel } from "@mui/x-data-grid";

export interface WorkgroupAdministrationContextProps {
  workgroupTableSortModel: GridSortModel;
  setworkgroupTableSortModel: (model: GridSortModel) => void;
}

export const WorkgroupAdministrationContext = createContext<WorkgroupAdministrationContextProps>({
  workgroupTableSortModel: [],
  setworkgroupTableSortModel: () => {},
});

export const WorkgroupAdministrationProvider: FC<PropsWithChildren> = ({ children }) => {
  const [workgroupTableSortModel, setworkgroupTableSortModel] = useState<GridSortModel>([]);
  return (
    <WorkgroupAdministrationContext.Provider
      value={useMemo(
        () => ({
          workgroupTableSortModel,
          setworkgroupTableSortModel,
        }),
        [workgroupTableSortModel],
      )}>
      {children}
    </WorkgroupAdministrationContext.Provider>
  );
};
