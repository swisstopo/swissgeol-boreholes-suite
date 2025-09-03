import { createContext, useContext } from "react";

interface ScaleContextType {
  scaleY: number;
  translateY: number;
}
export const ScaleContext = createContext<ScaleContextType>({ scaleY: 1, translateY: 0 });
export const useScaleContext = () => useContext(ScaleContext);
