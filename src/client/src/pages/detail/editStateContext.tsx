import { createContext, FC, PropsWithChildren, useMemo, useState } from "react";
import { useBoreholeEditable } from "../../api/borehole.ts";
import { useRequiredId } from "../../hooks/useRequiredId.ts";

interface EditStateContextProps {
  editingEnabled: boolean;
  setEditingEnabled: (editingEnabled: boolean) => void;
}

export const EditStateContext = createContext<EditStateContextProps>({
  editingEnabled: false,
  setEditingEnabled: () => {},
});

export const EditStateProvider: FC<PropsWithChildren> = ({ children }) => {
  const id = useRequiredId();
  const { data: editableByCurrentUser } = useBoreholeEditable(id);
  const [editingEnabled, setEditingEnabled] = useState<boolean>(false);

  const contextValue = useMemo(
    () => ({
      editingEnabled: editingEnabled && editableByCurrentUser === true,
      setEditingEnabled,
    }),
    [editableByCurrentUser, editingEnabled],
  );

  return <EditStateContext.Provider value={contextValue}>{children}</EditStateContext.Provider>;
};
