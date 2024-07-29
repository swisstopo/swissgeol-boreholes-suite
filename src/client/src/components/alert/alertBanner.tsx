import { useContext } from "react";
import { AlertContext } from "./alertContext";
import { Alert, Snackbar } from "@mui/material";

export const AlertBanner = () => {
  const alertContext = useContext(AlertContext);
  return (
    alertContext.alertIsOpen && (
      <Snackbar
        open={alertContext.alertIsOpen}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
        autoHideDuration={alertContext.autoHideDuration}
        onClose={alertContext.closeAlert}>
        <Alert variant="filled" severity={alertContext.severity} onClose={alertContext.closeAlert}>
          {alertContext.text}
        </Alert>
      </Snackbar>
    )
  );
};
