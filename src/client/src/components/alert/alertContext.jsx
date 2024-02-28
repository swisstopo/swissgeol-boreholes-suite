import { useState, createContext } from "react";
export const AlertContext = createContext({
  alertSeverity: null,
  alertText: null,
  success: () => {},
  error: () => {},
});

export const AlertProvider = props => {
  const [severity, setSeverity] = useState(null);
  const [text, setText] = useState(null);

  const success = text => {
    setText(text);
    setSeverity("success");
  };
  const error = text => {
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
      {props.children}
    </AlertContext.Provider>
  );
};
