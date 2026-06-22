import { createContext, Dispatch, FC, ReactNode, SetStateAction, useContext, useEffect, useState } from "react";
import { Workgroup } from "../../api/generated";
import { getEditableWorkgroups, useCurrentUser } from "../../api/user.ts";

interface UserWorkgroupsContextType {
  enabledWorkgroups: Workgroup[];
  currentWorkgroupId: number | null;
  setCurrentWorkgroupId: Dispatch<SetStateAction<number | null>>;
}

const UserWorkgroupsContext = createContext<UserWorkgroupsContextType | undefined>(undefined);

interface UserWorkgroupsProviderProps {
  children: ReactNode;
}

export const UserWorkgroupsProvider: FC<UserWorkgroupsProviderProps> = ({ children }) => {
  const [enabledWorkgroups, setEnabledWorkgroups] = useState<Workgroup[]>([]);
  const [currentWorkgroupId, setCurrentWorkgroupId] = useState<number | null>(null);

  const { data: user } = useCurrentUser();

  useEffect(() => {
    const editableWorkgroups = getEditableWorkgroups(user);
    setEnabledWorkgroups(editableWorkgroups);
    setCurrentWorkgroupId(editableWorkgroups.length > 0 ? editableWorkgroups[0].id : null);
  }, [user]);

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
    throw new Error("useUserWorkgroups must be used within a UserWorkgroupsProvider");
  }
  return context;
};
