import { ReactNode } from "react";
import { AlertColor } from "@mui/material";

export interface AlertContextInterface {
  alertIsOpen: boolean;
  text: string | undefined;
  severity: AlertColor | undefined;
  autoHideDuration: number | null;
  showAlert: (text: string, severity?: AlertColor, allowAutoHide?: boolean) => void;
  closeAlert: () => void;
}

export interface AlertOptions {
  text: string;
  severity?: AlertColor;
  allowAutoHide?: boolean;
}

export interface AlertProviderProps {
  children: ReactNode;
}
