import { createContext, Dispatch, FC, PropsWithChildren, SetStateAction, useMemo, useState } from "react";
import Feature from "ol/Feature";

interface PolygonFilterContextInterface {
  filterPolygon: Feature | null;
  setFilterPolygon: Dispatch<SetStateAction<Feature | null>>;
  polygonSelectionEnabled: boolean;
  setPolygonSelectionEnabled: Dispatch<SetStateAction<boolean>>;
  featureIds: number[];
  setFeatureIds: Dispatch<SetStateAction<number[]>>;
}

export const PolygonFilterContext = createContext<PolygonFilterContextInterface>({} as PolygonFilterContextInterface);

export const PolygonFilterProvider: FC<PropsWithChildren> = ({ children }) => {
  const [filterPolygon, setFilterPolygon] = useState<Feature | null>(null);
  const [polygonSelectionEnabled, setPolygonSelectionEnabled] = useState(false);
  const [featureIds, setFeatureIds] = useState<number[]>([]);

  const value = useMemo(
    () => ({
      filterPolygon,
      setFilterPolygon,
      polygonSelectionEnabled,
      setPolygonSelectionEnabled,
      featureIds,
      setFeatureIds,
    }),
    [filterPolygon, polygonSelectionEnabled, featureIds],
  );

  return <PolygonFilterContext.Provider value={value}>{children}</PolygonFilterContext.Provider>;
};
