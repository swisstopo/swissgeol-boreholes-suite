import { AlertColor, AlertProps } from "@mui/material";

export type AlertVariant = NonNullable<AlertProps["variant"]>;

export interface AlertContextInterface {
  alertIsOpen: boolean;
  text: string | undefined;
  showAlert: (text: string, severity?: AlertColor, allowAutoHide?: boolean, variant?: AlertVariant) => void;
  closeAlert: () => void;
  severity?: AlertColor;
  autoHideDuration?: number;
  variant?: AlertVariant;
}

export interface AlertOptions {
  text: string;
  severity?: AlertColor;
  allowAutoHide?: boolean;
  variant?: AlertVariant;
}
