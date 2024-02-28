import { useContext } from "react";
import Alert from "@mui/material/Alert";
import Snackbar from "@mui/material/Snackbar";
import { AlertContext } from "./alertContext";

export const AlertBanner = () => {
  const alertContext = useContext(AlertContext);
  return (
    alertContext.text && (
      <Snackbar
        open={alertContext.text !== null}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
        autoHideDuration={6000}
        onClose={() => {
          alertContext.clear();
        }}>
        <Alert
          severity={alertContext.severity}
          onClose={() => {
            alertContext.clear();
          }}>
          {alertContext.text}
        </Alert>
      </Snackbar>
    )
  );
};
