import { createContext, FC, PropsWithChildren, useMemo, useState } from "react";
import { useBoreholeEditable } from "../../api/borehole.ts";
import { useRequiredParams } from "../../hooks/useRequiredParams.ts";

export interface EditStateContextProps {
  editingEnabled: boolean;
  setEditingEnabled: (editingEnabled: boolean) => void;
}

export const EditStateContext = createContext<EditStateContextProps>({
  editingEnabled: false,
  setEditingEnabled: () => {},
});

export const EditStateProvider: FC<PropsWithChildren> = ({ children }) => {
  const { id } = useRequiredParams<{ id: string }>();
  const { data: editableByCurrentUser } = useBoreholeEditable(parseInt(id));
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
