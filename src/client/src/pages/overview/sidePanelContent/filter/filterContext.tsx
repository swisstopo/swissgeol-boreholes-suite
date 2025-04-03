import { createContext, Dispatch, FC, PropsWithChildren, SetStateAction, useState } from "react";
import Polygon from "ol/geom/Polygon";
import { ShowAllActiveFields } from "./filterData/filterInterfaces.ts";

interface FilterContextInterface {
  filterPolygon: Polygon | null;
  setFilterPolygon: Dispatch<SetStateAction<Polygon | null>>;
  polygonSelectionEnabled: boolean;
  setPolygonSelectionEnabled: Dispatch<SetStateAction<boolean>>;
  featureIds: number[];
  setFeatureIds: Dispatch<SetStateAction<number[]>>;
  activeFilterLength: number;
  setActiveFilterLength: Dispatch<SetStateAction<number>>;
  showAllActiveFields: Partial<ShowAllActiveFields>;
  setShowAllActiveFields: Dispatch<SetStateAction<Partial<ShowAllActiveFields>>>;
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
