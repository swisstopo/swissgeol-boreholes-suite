import { createContext, FC, PropsWithChildren } from "react";

import { AlertContextInterface } from "./alertInterfaces";
import { useAlertManager } from "./alertManager.tsx";

export const AlertContext = createContext<AlertContextInterface>({
  alertIsOpen: false,
  text: undefined,
  severity: undefined,
  autoHideDuration: null,
  showAlert: () => {},
  closeAlert: () => {},
});

export const AlertProvider: FC<PropsWithChildren> = ({ children }) => {
  const alertManager = useAlertManager();

  return <AlertContext.Provider value={alertManager}>{children}</AlertContext.Provider>;
};
