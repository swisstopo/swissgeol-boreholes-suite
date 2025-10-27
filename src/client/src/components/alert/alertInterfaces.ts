import { ReactNode } from "react";
import { AlertColor } from "@mui/material";

export interface AlertContextInterface {
  alertIsOpen: boolean;
  text: string | ReactNode | undefined;
  severity: AlertColor | undefined;
  autoHideDuration: number | null;
  showAlert: (text: string | ReactNode, severity?: AlertColor, allowAutoHide?: boolean) => void;
  closeAlert: () => void;
}

export interface AlertOptions {
  text: string | ReactNode;
  severity?: AlertColor;
  allowAutoHide?: boolean;
}
