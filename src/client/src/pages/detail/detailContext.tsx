import { createContext, FC, PropsWithChildren, useCallback, useState } from "react";
import { BoreholeV2, getBoreholeById } from "../../api/borehole.ts";

export interface DetailContextProps {
  borehole: BoreholeV2 | null;
  setBorehole: (borehole: BoreholeV2) => void;
  reloadBorehole: () => void;
  editingEnabled: boolean;
  setEditingEnabled: (editingEnabled: boolean) => void;
}

export const DetailContext = createContext<DetailContextProps>({
  editingEnabled: false,
  setEditingEnabled: () => {},
  borehole: null,
  setBorehole: () => {},
  reloadBorehole: () => {},
});

export const DetailProvider: FC<PropsWithChildren> = ({ children }) => {
  const [editingEnabled, setEditingEnabled] = useState<boolean>(false);
  const [borehole, setBorehole] = useState<BoreholeV2 | null>(null);

  const reloadBorehole = useCallback(() => {
    if (borehole) {
      getBoreholeById(borehole.id).then(setBorehole);
    }
  }, [borehole]);

  return (
    <DetailContext.Provider value={{ borehole, setBorehole, reloadBorehole, editingEnabled, setEditingEnabled }}>
      {children}
    </DetailContext.Provider>
  );
};
