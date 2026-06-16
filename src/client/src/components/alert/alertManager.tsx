import { useCallback, useEffect, useState } from "react";
import { AlertColor } from "@mui/material";
import { AlertOptions, AlertVariant } from "./alertInterfaces";

export const useAlertManager = () => {
  const [currentAlert, setCurrentAlert] = useState<AlertOptions>();
  const [alerts, setAlerts] = useState<AlertOptions[]>([]);

  const showAlert = useCallback(
    (text: string, severity: AlertColor | undefined, allowAutoHide?: boolean, variant?: AlertVariant) => {
      const newAlert = {
        text,
        severity: severity ?? "info",
        allowAutoHide: allowAutoHide ?? true,
        variant: variant ?? "filled",
      };
      setAlerts(prevAlerts => [...prevAlerts, newAlert]);
    },
    [],
  );

  const closeAlert = () => {
    setCurrentAlert(undefined);
  };

  useEffect(() => {
    if (alerts.length > 0 && !currentAlert) {
      setCurrentAlert(alerts[0]);
      setAlerts(prevAlerts => prevAlerts.slice(1));
    }
  }, [alerts, currentAlert]);

  return {
    alertIsOpen: currentAlert?.text != null,
    text: currentAlert?.text,
    severity: currentAlert?.severity,
    variant: currentAlert?.variant,
    autoHideDuration: currentAlert?.allowAutoHide === true ? 6000 : undefined,
    showAlert,
    closeAlert,
  };
};
