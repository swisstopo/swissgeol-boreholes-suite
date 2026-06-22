import {
  createContext,
  Dispatch,
  FC,
  ReactNode,
  SetStateAction,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { Workgroup } from "../../api/generated";
import { getEditableWorkgroups, useCurrentUser } from "../../api/user.ts";

interface UserWorkgroupsContextType {
  editableWorkgroups: Workgroup[];
  currentWorkgroupId: number | null;
  setCurrentWorkgroupId: Dispatch<SetStateAction<number | null>>;
}

const UserWorkgroupsContext = createContext<UserWorkgroupsContextType | undefined>(undefined);

interface UserWorkgroupsProviderProps {
  children: ReactNode;
}

export const UserWorkgroupsProvider: FC<UserWorkgroupsProviderProps> = ({ children }) => {
  const { data: user } = useCurrentUser();
  const editableWorkgroups = useMemo(() => getEditableWorkgroups(user), [user]);
  const [currentWorkgroupId, setCurrentWorkgroupId] = useState<number | null>(null);

  // Default the selected workgroup to the first editable one whenever the user changes.
  useEffect(() => {
    setCurrentWorkgroupId(editableWorkgroups.length > 0 ? editableWorkgroups[0].id : null);
  }, [editableWorkgroups]);

  return (
    <UserWorkgroupsContext.Provider
      value={{
        editableWorkgroups,
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
