import { createContext, FC, PropsWithChildren, useMemo, useState } from "react";
import { GridSortModel } from "@mui/x-data-grid";
import { User } from "../../../api/apiInterfaces.ts";

export interface UserAdministrationContextProps {
  users: User[];
  setUsers: (users: User[]) => void;
  selectedUser: User | null;
  setSelectedUser: (user: User | null) => void;
  userTableSortModel: GridSortModel;
  setUserTableSortModel: (model: GridSortModel) => void;
  userDetailTableSortModel: GridSortModel;
  setUserDetailTableSortModel: (model: GridSortModel) => void;
}

export const UserAdministrationContext = createContext<UserAdministrationContextProps>({
  users: [],
  setUsers: () => {},
  selectedUser: null,
  setSelectedUser: () => {},
  userTableSortModel: [],
  setUserTableSortModel: () => {},
  userDetailTableSortModel: [],
  setUserDetailTableSortModel: () => {},
});

export const UserAdministrationProvider: FC<PropsWithChildren> = ({ children }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [userTableSortModel, setUserTableSortModel] = useState<GridSortModel>([{ field: "lastName", sort: "asc" }]);
  const [userDetailTableSortModel, setUserDetailTableSortModel] = useState<GridSortModel>([
    { field: "name", sort: "asc" },
  ]);
  return (
    <UserAdministrationContext.Provider
      value={useMemo(
        () => ({
          users,
          setUsers,
          selectedUser,
          setSelectedUser,
          userTableSortModel,
          setUserTableSortModel,
          userDetailTableSortModel,
          setUserDetailTableSortModel,
        }),
        [users, selectedUser, userDetailTableSortModel, userTableSortModel],
      )}>
      {children}
    </UserAdministrationContext.Provider>
  );
};
