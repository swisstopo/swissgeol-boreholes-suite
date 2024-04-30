import { useState, createContext } from "react";
import { AlertContextInterface, AlertProviderProps } from "./alertInterfaces";

const defaultState: AlertContextInterface = {
  success: () => {},
  error: () => {},
  clear: () => {},
  text: null,
  severity: null,
};

export const AlertContext = createContext<AlertContextInterface>(defaultState);

export const AlertProvider: React.FC<AlertProviderProps> = ({ children }) => {
  const [text, setText] = useState<string | null>(null);
  const [severity, setSeverity] = useState<"success" | "error" | null>(null);

  const success = (text: string) => {
    setText(text);
    setSeverity("success");
  };

  const error = (text: string) => {
    setText(text);
    setSeverity("error");
  };

  const clear = () => {
    setText(null);
    setSeverity(null);
  };
  return (
    <AlertContext.Provider
      value={{
        success,
        error,
        clear,
        text,
        severity,
      }}>
      {children}
    </AlertContext.Provider>
  );
};
