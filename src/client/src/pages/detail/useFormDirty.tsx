import { useContext } from "react";
import { FormDirtyContext } from "./formDirtyContext.tsx";

export const useFormDirty = () => {
  const context = useContext(FormDirtyContext);
  if (!context) {
    throw new Error("useFormDirty must be used within a FormDirtyProvider");
  }
  return context;
};
