import { createContext, FC, PropsWithChildren, useContext, useMemo, useState } from "react";

interface ScaleContextProps {
  scaleY: number;
  translateY: number;
  setScaleY: (scaleY: number) => void;
  setTranslateY: (translateY: number) => void;
}

export const ScaleContext = createContext<ScaleContextProps>({
  scaleY: 1,
  translateY: 0,
  setScaleY: () => {},
  setTranslateY: () => {},
});

export const useScaleContext = () => useContext(ScaleContext);

export const ScaleContextProvider: FC<PropsWithChildren> = ({ children }) => {
  const [scaleY, setScaleY] = useState<number>(1);
  const [translateY, setTranslateY] = useState<number>(0);

  const contextValue = useMemo(
    () => ({
      scaleY,
      setScaleY,
      translateY,
      setTranslateY,
    }),
    [scaleY, translateY],
  );

  return <ScaleContext.Provider value={contextValue}>{children}</ScaleContext.Provider>;
};
