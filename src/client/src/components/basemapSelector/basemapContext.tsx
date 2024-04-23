import React, { useState, createContext } from "react";

interface BasemapContextType {
  currentBasemapName: string;
  setBasemapName: (layerName: string) => void;
}

export const BasemapContext = createContext<BasemapContextType>({
  currentBasemapName: "colormap",
  setBasemapName: () => {},
});

export const BasemapProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentBasemapName, setCurrentBasemapName] = useState<string>("colormap");

  const setBasemapName = (layerName: string) => {
    setCurrentBasemapName(layerName);
  };

  return (
    <BasemapContext.Provider
      value={{
        currentBasemapName,
        setBasemapName,
      }}>
      {children}
    </BasemapContext.Provider>
  );
};
