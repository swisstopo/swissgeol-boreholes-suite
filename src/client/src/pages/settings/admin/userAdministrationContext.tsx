import { createContext, FC, PropsWithChildren, useMemo, useState } from "react";
import { GridSortModel } from "@mui/x-data-grid";
import { User } from "../../../api/apiInterfaces.ts";

export interface UserAdministrationContextProps {
  selectedUser: User | null;
  setSelectedUser: (user: User | null) => void;
  userTableSortModel: GridSortModel;
  setUserTableSortModel: (model: GridSortModel) => void;
}

export const UserAdministrationContext = createContext<UserAdministrationContextProps>({
  selectedUser: null,
  setSelectedUser: () => {},
  userTableSortModel: [],
  setUserTableSortModel: () => {},
});

export const UserAdministrationProvider: FC<PropsWithChildren> = ({ children }) => {
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [userTableSortModel, setUserTableSortModel] = useState<GridSortModel>([]);
  return (
    <UserAdministrationContext.Provider
      value={useMemo(
        () => ({ selectedUser, setSelectedUser, userTableSortModel, setUserTableSortModel }),
        [selectedUser, userTableSortModel],
      )}>
      {children}
    </UserAdministrationContext.Provider>
  );
};
