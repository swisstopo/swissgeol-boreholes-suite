import { createContext, Dispatch, FC, PropsWithChildren, SetStateAction, useContext, useMemo, useState } from "react";

interface ScaleContextProps {
  scaleY: number;
  translateY: number;
  tableHeight: number;
  pxPerMeter: number;
  visibleStart: number;
  visibleEnd: number;
  maxDepth: number;
  setMaxDepth: Dispatch<SetStateAction<number>>;
  setTableHeight: Dispatch<SetStateAction<number>>;
  setScaleY: Dispatch<SetStateAction<number>>;
  setTranslateY: Dispatch<SetStateAction<number>>;
}

export const ScaleContext = createContext<ScaleContextProps>({
  scaleY: 1,
  translateY: 0,
  tableHeight: 600,
  pxPerMeter: 10,
  visibleStart: 0,
  visibleEnd: 0,
  maxDepth: 100,
  setScaleY: () => {},
  setTranslateY: () => {},
  setMaxDepth: () => {},
  setTableHeight: () => {},
});

export const useScaleContext = () => useContext(ScaleContext);

export const ScaleContextProvider: FC<PropsWithChildren> = ({ children }) => {
  const [scaleY, setScaleY] = useState<number>(1);
  const [translateY, setTranslateY] = useState<number>(0);
  const [maxDepth, setMaxDepth] = useState<number>(100);
  const [tableHeight, setTableHeight] = useState<number>(600);
  const pxPerMeter = 10;
  const visibleStart = (-translateY / (maxDepth * pxPerMeter * scaleY)) * maxDepth;
  const visibleEnd = ((-translateY + tableHeight) / (maxDepth * pxPerMeter * scaleY)) * maxDepth;

  const contextValue = useMemo(
    () => ({
      scaleY,
      setScaleY,
      translateY,
      setTranslateY,
      maxDepth,
      setMaxDepth,
      tableHeight,
      setTableHeight,
      pxPerMeter,
      visibleStart,
      visibleEnd,
    }),
    [maxDepth, scaleY, tableHeight, translateY, visibleEnd, visibleStart],
  );

  return <ScaleContext.Provider value={contextValue}>{children}</ScaleContext.Provider>;
};
