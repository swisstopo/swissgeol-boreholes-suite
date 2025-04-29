import { createContext, FC, PropsWithChildren, useState } from "react";
import { BoreholeV2 } from "../../api/borehole.ts";

export interface DetailContextProps {
  borehole: BoreholeV2 | null;
  setBorehole: (borehole: BoreholeV2) => void;
  editingEnabled: boolean;
  setEditingEnabled: (editingEnabled: boolean) => void;
}

export const DetailContext = createContext<DetailContextProps>({
  editingEnabled: false,
  setEditingEnabled: () => {},
  borehole: null,
  setBorehole: () => {},
});

export const DetailProvider: FC<PropsWithChildren> = ({ children }) => {
  const [editingEnabled, setEditingEnabled] = useState<boolean>(false);
  const [borehole, setBorehole] = useState<BoreholeV2 | null>(null);

  return (
    <DetailContext.Provider value={{ borehole, setBorehole, editingEnabled, setEditingEnabled }}>
      {children}
    </DetailContext.Provider>
  );
};
