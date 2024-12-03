import React, { createContext, useState } from "react";

interface FormDirtyContextType {
  isFormDirty: boolean;
  setIsFormDirty: (dirty: boolean) => void;
}

export const FormDirtyContext = createContext<FormDirtyContextType | undefined>(undefined);

export const FormDirtyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isFormDirty, setIsFormDirty] = useState(false);

  return <FormDirtyContext.Provider value={{ isFormDirty, setIsFormDirty }}>{children}</FormDirtyContext.Provider>;
};
