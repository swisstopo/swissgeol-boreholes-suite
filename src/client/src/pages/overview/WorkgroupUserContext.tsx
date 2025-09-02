import React, { createContext, ReactNode, useContext, useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { ReduxRootState, User, Workgroup } from "../../api-lib/ReduxStateInterfaces";

interface UserWorkgroupsContextType {
  enabledWorkgroups: Workgroup[];
  currentWorkgroupId: number | null;
  setCurrentWorkgroupId: React.Dispatch<React.SetStateAction<number | null>>;
}

const UserWorkgroupsContext = createContext<UserWorkgroupsContextType | undefined>(undefined);

interface UserWorkgroupsProviderProps {
  children: ReactNode;
}

export const UserWorkgroupsProvider: React.FC<UserWorkgroupsProviderProps> = ({ children }) => {
  const [enabledWorkgroups, setEnabledWorkgroups] = useState<Workgroup[]>([]);
  const [currentWorkgroupId, setCurrentWorkgroupId] = useState<number | null>(null);

  // Display all workgroups with hierarchical roles =>  Todo: getting all workgroups with edit rights for the user should be moved to the backend
  // Also this context still uses the legacy workgroup roles.
  const user: User = useSelector((state: ReduxRootState) => state.core_user);

  useEffect(() => {
    const wgs = user.data.workgroups.filter(
      (w: Workgroup) =>
        w.disabled === null && w.roles.some(role => ["EDIT", "CONTROL", "VALID", "PUBLIC"].includes(role)),
    );
    setEnabledWorkgroups(wgs);
    setCurrentWorkgroupId(wgs.length > 0 ? wgs[0].id : null);
  }, [user.data.workgroups]);

  return (
    <UserWorkgroupsContext.Provider
      value={{
        enabledWorkgroups,
        currentWorkgroupId,
        setCurrentWorkgroupId,
      }}>
      {children}
    </UserWorkgroupsContext.Provider>
  );
};

export const useUserWorkgroups = (): UserWorkgroupsContextType => {
  const context = useContext(UserWorkgroupsContext);
  if (context === undefined) {
    throw new Error("useWorkgroups must be used within a UserWorkgroupsProvider");
  }
  return context;
};
