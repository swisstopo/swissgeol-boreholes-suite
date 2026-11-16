import { createContext, Dispatch, FC, PropsWithChildren, SetStateAction, useMemo, useState } from "react";

interface PolygonFilterContextInterface {
  // Whether the map is in polygon drawing mode. The polygon itself is a URL filter.
  polygonSelectionEnabled: boolean;
  setPolygonSelectionEnabled: Dispatch<SetStateAction<boolean>>;
}

export const PolygonFilterContext = createContext<PolygonFilterContextInterface>({} as PolygonFilterContextInterface);

export const PolygonFilterProvider: FC<PropsWithChildren> = ({ children }) => {
  const [polygonSelectionEnabled, setPolygonSelectionEnabled] = useState(false);

  const value = useMemo(() => ({ polygonSelectionEnabled, setPolygonSelectionEnabled }), [polygonSelectionEnabled]);

  return <PolygonFilterContext.Provider value={value}>{children}</PolygonFilterContext.Provider>;
};
