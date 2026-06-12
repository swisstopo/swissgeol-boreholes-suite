import { AlertColor, AlertProps } from "@mui/material";

export type AlertVariant = NonNullable<AlertProps["variant"]>;

export interface AlertContextInterface {
  alertIsOpen: boolean;
  text: string | undefined;
  severity: AlertColor | undefined;
  variant: AlertVariant | undefined;
  autoHideDuration: number | null;
  showAlert: (text: string, severity?: AlertColor, allowAutoHide?: boolean, variant?: AlertVariant) => void;
  closeAlert: () => void;
}

export interface AlertOptions {
  text: string;
  severity?: AlertColor;
  allowAutoHide?: boolean;
  variant?: AlertVariant;
}
