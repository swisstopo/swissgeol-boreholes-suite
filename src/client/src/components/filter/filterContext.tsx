import React, { createContext, ReactNode, useState } from "react";
import Polygon from "ol/geom/Polygon";

interface FilterContextInterface {
  filterPolygon: Polygon | null;
  setFilterPolygon: (filterPolygon: Polygon | null) => void;
  polygonSelectionEnabled: boolean;
  setPolygonSelectionEnabled: (polygonSelectionEnabled: boolean) => void;
  featureIds: number[];
  setFeatureIds: (featureIds: number[]) => void;
}

interface FilterProviderProps {
  children: ReactNode;
}

export const FilterContext = createContext<FilterContextInterface>({
  filterPolygon: null,
  setFilterPolygon: () => {},
  polygonSelectionEnabled: false,
  setPolygonSelectionEnabled: () => {},
  featureIds: [],
  setFeatureIds: () => {},
});

export const FilterProvider: React.FC<FilterProviderProps> = ({ children }) => {
  const [filterPolygon, setFilterPolygon] = useState<Polygon | null>(null);
  const [polygonSelectionEnabled, setPolygonSelectionEnabled] = useState(false);
  const [featureIds, setFeatureIds] = useState<number[]>([]);

  return (
    <FilterContext.Provider
      value={{
        filterPolygon,
        setFilterPolygon,
        polygonSelectionEnabled,
        setPolygonSelectionEnabled,
        featureIds,
        setFeatureIds,
      }}>
      {children}
    </FilterContext.Provider>
  );
};
