import React, { useContext } from "react";
import Alert from "@mui/material/Alert";
import Snackbar from "@mui/material/Snackbar";
import { AlertContext } from "./alertContext";

export const AlertBanner = props => {
  const alertContext = useContext(AlertContext);
  return (
    alertContext.text && (
      <Snackbar
        open={alertContext.text !== null}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
        autoHideDuration={6000}>
        <Alert
          onClose={() => {
            alertContext.clear();
          }}
          severity={alertContext.severity}>
          {alertContext.text}
        </Alert>
      </Snackbar>
    )
  );
};
