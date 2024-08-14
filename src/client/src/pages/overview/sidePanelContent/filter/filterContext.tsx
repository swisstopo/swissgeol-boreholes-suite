import { createContext, FC, PropsWithChildren, useState } from "react";
import Polygon from "ol/geom/Polygon";

interface FilterContextInterface {
  filterPolygon: Polygon | null;
  setFilterPolygon: (filterPolygon: Polygon | null) => void;
  polygonSelectionEnabled: boolean;
  setPolygonSelectionEnabled: (polygonSelectionEnabled: boolean) => void;
  featureIds: number[];
  setFeatureIds: (featureIds: number[]) => void;
  activeFilterLength: number;
  setActiveFilterLength: (length: number) => void;
}

export const FilterContext = createContext<FilterContextInterface>({
  filterPolygon: null,
  setFilterPolygon: () => {},
  polygonSelectionEnabled: false,
  setPolygonSelectionEnabled: () => {},
  featureIds: [],
  setFeatureIds: () => {},
  activeFilterLength: 0,
  setActiveFilterLength: () => {},
});

export const FilterProvider: FC<PropsWithChildren> = ({ children }) => {
  const [filterPolygon, setFilterPolygon] = useState<Polygon | null>(null);
  const [polygonSelectionEnabled, setPolygonSelectionEnabled] = useState(false);
  const [featureIds, setFeatureIds] = useState<number[]>([]);
  const [activeFilterLength, setActiveFilterLength] = useState(0);
  return (
    <FilterContext.Provider
      value={{
        filterPolygon,
        setFilterPolygon,
        polygonSelectionEnabled,
        setPolygonSelectionEnabled,
        featureIds,
        setFeatureIds,
        activeFilterLength,
        setActiveFilterLength,
      }}>
      {children}
    </FilterContext.Provider>
  );
};
