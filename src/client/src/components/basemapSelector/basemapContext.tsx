import { createContext, FC, PropsWithChildren, useState } from "react";

interface BasemapContextType {
  currentBasemapName: string;
  setBasemapName: (layerName: string) => void;
}

export const BasemapContext = createContext<BasemapContextType>({
  currentBasemapName: "ch.swisstopo.pixelkarte-farbe",
  setBasemapName: () => {},
});

export const BasemapProvider: FC<PropsWithChildren> = ({ children }) => {
  const [currentBasemapName, setCurrentBasemapName] = useState<string>("ch.swisstopo.pixelkarte-farbe");

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
