import { createContext, FC, PropsWithChildren, useMemo, useState } from "react";

export interface EditStateContextProps {
  editingEnabled: boolean;
  setEditingEnabled: (editingEnabled: boolean) => void;
}

export const EditStateContext = createContext<EditStateContextProps>({
  editingEnabled: false,
  setEditingEnabled: () => {},
});

export const EditStateProvider: FC<PropsWithChildren> = ({ children }) => {
  const [editingEnabled, setEditingEnabled] = useState<boolean>(false);

  const contextValue = useMemo(
    () => ({
      editingEnabled,
      setEditingEnabled,
    }),
    [editingEnabled],
  );

  return <EditStateContext.Provider value={contextValue}>{children}</EditStateContext.Provider>;
};
