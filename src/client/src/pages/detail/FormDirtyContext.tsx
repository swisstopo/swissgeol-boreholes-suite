import React, { createContext, useContext, useState } from "react";

interface FormDirtyContextType {
  isFormDirty: boolean;
  setIsFormDirty: (dirty: boolean) => void;
}

const FormDirtyContext = createContext<FormDirtyContextType | undefined>(undefined);

export const FormDirtyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isFormDirty, setIsFormDirty] = useState(false);

  return <FormDirtyContext.Provider value={{ isFormDirty, setIsFormDirty }}>{children}</FormDirtyContext.Provider>;
};

export const useFormDirty = () => {
  const context = useContext(FormDirtyContext);
  if (!context) throw new Error("useFormDirty must be used within a FormDirtyProvider");
  return context;
};
