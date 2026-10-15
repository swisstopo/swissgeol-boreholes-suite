import { useCallback, useRef, useState } from "react";
import { AlertColor } from "@mui/material";
import { AlertOptions, AlertVariant } from "./alertInterfaces";

interface QueuedAlert extends AlertOptions {
  id: number;
}

export const useAlertManager = () => {
  const [alerts, setAlerts] = useState<QueuedAlert[]>([]);
  const nextAlertId = useRef(0);
  const currentAlert = alerts.at(0);
  const currentAlertId = currentAlert?.id;

  const showAlert = useCallback(
    (text: string, severity: AlertColor | undefined, allowAutoHide?: boolean, variant?: AlertVariant) => {
      const newAlert = {
        id: nextAlertId.current++,
        text,
        severity: severity ?? "info",
        allowAutoHide: allowAutoHide ?? true,
        variant: variant ?? "filled",
      };
      setAlerts(prevAlerts => [...prevAlerts, newAlert]);
    },
    [],
  );

  // Closing is bound to the alert shown at the time, so repeated close calls cannot skip queued alerts.
  const closeAlert = useCallback(() => {
    setAlerts(prevAlerts => (prevAlerts.at(0)?.id === currentAlertId ? prevAlerts.slice(1) : prevAlerts));
  }, [currentAlertId]);

  return {
    alertIsOpen: currentAlert?.text != null,
    text: currentAlert?.text,
    severity: currentAlert?.severity,
    variant: currentAlert?.variant,
    autoHideDuration: currentAlert?.allowAutoHide === true ? 6000 : undefined,
    showAlert,
    closeAlert,
    alertId: currentAlertId,
  };
};
