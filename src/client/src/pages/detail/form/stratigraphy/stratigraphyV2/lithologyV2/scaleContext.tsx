import { createContext, useContext } from "react";

interface ScaleContextType {
  scaleY: number;
  translateY: number;
  setScaleY: (scaleY: number) => void;
  setTranslateY: (translateY: number) => void;
}
export const ScaleContext = createContext<ScaleContextType>({ scaleY: 1, translateY: 0 });
export const useScaleContext = () => useContext(ScaleContext);
