import React, { createContext, ReactNode, useState } from "react";
import { Borehole } from "../../ReduxStateInterfaces";

interface BoreholeDetailContextInterface {
  currentBorehole: Borehole | null;
  setCurrentBorehole: (borehole: Borehole) => void;
}

interface BoreholeDetailProviderProps {
  children: ReactNode;
}

export const BoreholeDetailContext = createContext<BoreholeDetailContextInterface>({
  currentBorehole: null,
  setCurrentBorehole: () => {},
});

export const BoreholeDetailProvider: React.FC<BoreholeDetailProviderProps> = ({ children }) => {
  const [currentBorehole, setCurrentBorehole] = useState<Borehole | null>(null);

  return (
    <BoreholeDetailContext.Provider
      value={{
        currentBorehole,
        setCurrentBorehole,
      }}>
      {children}
    </BoreholeDetailContext.Provider>
  );
};
