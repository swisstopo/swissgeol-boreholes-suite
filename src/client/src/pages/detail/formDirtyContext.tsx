import React, { createContext, useMemo, useState } from "react";

interface FormDirtyContextType {
  isFormDirty: boolean;
  setIsFormDirty: (dirty: boolean) => void;
}

export const FormDirtyContext = createContext<FormDirtyContextType | undefined>(undefined);

export const FormDirtyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isFormDirty, setIsFormDirty] = useState(false);
  const value = useMemo(() => ({ isFormDirty, setIsFormDirty }), [isFormDirty]);
  return <FormDirtyContext.Provider value={value}>{children}</FormDirtyContext.Provider>;
};
