import { createContext, FC, PropsWithChildren, useMemo, useState } from "react";
import { GridSortModel } from "@mui/x-data-grid";

export interface UserAdministrationContextProps {
  userTableSortModel: GridSortModel;
  setUserTableSortModel: (model: GridSortModel) => void;
  userDetailTableSortModel: GridSortModel;
  setUserDetailTableSortModel: (model: GridSortModel) => void;
}

export const UserAdministrationContext = createContext<UserAdministrationContextProps>({
  userTableSortModel: [],
  setUserTableSortModel: () => {},
  userDetailTableSortModel: [],
  setUserDetailTableSortModel: () => {},
});

export const UserAdministrationProvider: FC<PropsWithChildren> = ({ children }) => {
  const [userTableSortModel, setUserTableSortModel] = useState<GridSortModel>([{ field: "lastName", sort: "asc" }]);
  const [userDetailTableSortModel, setUserDetailTableSortModel] = useState<GridSortModel>([
    { field: "name", sort: "asc" },
  ]);
  return (
    <UserAdministrationContext.Provider
      value={useMemo(
        () => ({
          userTableSortModel,
          setUserTableSortModel,
          userDetailTableSortModel,
          setUserDetailTableSortModel,
        }),
        [userDetailTableSortModel, userTableSortModel],
      )}>
      {children}
    </UserAdministrationContext.Provider>
  );
};
