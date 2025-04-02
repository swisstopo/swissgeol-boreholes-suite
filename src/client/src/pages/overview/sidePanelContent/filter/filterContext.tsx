import { createContext, FC, PropsWithChildren, useState } from "react";
import Polygon from "ol/geom/Polygon";
import { ShowAllActiveFields } from "./filterData/filterInterfaces.ts";

interface FilterContextInterface {
  filterPolygon: Polygon | null;
  setFilterPolygon: (filterPolygon: Polygon | null) => void;
  polygonSelectionEnabled: boolean;
  setPolygonSelectionEnabled: (polygonSelectionEnabled: boolean) => void;
  featureIds: number[];
  setFeatureIds: (featureIds: number[]) => void;
  activeFilterLength: number;
  setActiveFilterLength: (length: number) => void;
  showAllActiveFields: Partial<ShowAllActiveFields>;
  setShowAllActiveFields: (showAllActive: Partial<ShowAllActiveFields>) => void;
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
  showAllActiveFields: {},
  setShowAllActiveFields: () => {},
});

export const FilterProvider: FC<PropsWithChildren> = ({ children }) => {
  const [filterPolygon, setFilterPolygon] = useState<Polygon | null>(null);
  const [polygonSelectionEnabled, setPolygonSelectionEnabled] = useState(false);
  const [featureIds, setFeatureIds] = useState<number[]>([]);
  const [activeFilterLength, setActiveFilterLength] = useState(0);
  const [showAllActiveFields, setShowAllActiveFields] = useState<Partial<ShowAllActiveFields>>({
    location: false,
    borehole: false,
    lithology: false,
    lithostratigraphy: false,
    chronostratigraphy: false,
    registration: false,
  });
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
        showAllActiveFields,
        setShowAllActiveFields,
      }}>
      {children}
    </FilterContext.Provider>
  );
};
