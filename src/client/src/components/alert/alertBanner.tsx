import { useContext } from "react";
import { Alert, Snackbar } from "@mui/material";
import { AlertContext } from "./alertContext";

export const AlertBanner = () => {
  const alertContext = useContext(AlertContext);
  return (
    alertContext.alertIsOpen && (
      <Snackbar
        key={alertContext.alertId}
        open={alertContext.alertIsOpen}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
        autoHideDuration={alertContext.autoHideDuration}
        // A click elsewhere does not close the alert: the click that triggered it, such as the second click
        // of a double-click, would otherwise close it right away.
        onClose={(_, reason) => {
          if (reason !== "clickaway") alertContext.closeAlert();
        }}>
        <Alert variant={alertContext.variant} severity={alertContext.severity} onClose={alertContext.closeAlert}>
          {alertContext.text}
        </Alert>
      </Snackbar>
    )
  );
};
