import { createContext, FC, PropsWithChildren, useMemo, useState } from "react";

export interface EditStateContextProps {
  editingEnabled: boolean;
  setEditingEnabled: (editingEnabled: boolean) => void;
}

export const DetailContext = createContext<EditStateContextProps>({
  editingEnabled: false,
  setEditingEnabled: () => {},
});

export const DetailProvider: FC<PropsWithChildren> = ({ children }) => {
  const [editingEnabled, setEditingEnabled] = useState<boolean>(false);

  const contextValue = useMemo(
    () => ({
      editingEnabled,
      setEditingEnabled,
    }),
    [editingEnabled],
  );

  return <DetailContext.Provider value={contextValue}>{children}</DetailContext.Provider>;
};
