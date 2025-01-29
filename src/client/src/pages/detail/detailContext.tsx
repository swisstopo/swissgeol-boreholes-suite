import { createContext, FC, PropsWithChildren, useMemo, useState } from "react";

export interface DetailContextProps {
  editingEnabled: boolean;
  setEditingEnabled: (editingEnabled: boolean) => void;
}

export const DetailContext = createContext<DetailContextProps>({
  editingEnabled: false,
  setEditingEnabled: () => {},
});

export const DetailProvider: FC<PropsWithChildren> = ({ children }) => {
  const [editingEnabled, setEditingEnabled] = useState<boolean>(false);
  return (
    <DetailContext.Provider
      value={useMemo(() => ({ editingEnabled, setEditingEnabled }), [editingEnabled, setEditingEnabled])}>
      {children}
    </DetailContext.Provider>
  );
};
