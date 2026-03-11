import { useCallback, useContext, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { AlertColor } from "@mui/material";
import { ApiError } from "../api/apiInterfaces.ts";
import { AlertContext } from "../components/alert/alertContext.tsx";

export function useApiErrorAlert(severity: AlertColor = "error") {
  const { t } = useTranslation();
  const { showAlert } = useContext(AlertContext);

  return useCallback(
    (error: unknown) => {
      let errorMessage = t("errorWhileFetchingData");
      if (error instanceof ApiError && error.message) {
        errorMessage = t(error.message);
      }
      showAlert(errorMessage, severity);
    },
    [severity, showAlert, t],
  );
}

/**
 * Custom hook to display error messages when an API error occurs
 *
 * @param isError - Boolean flag indicating if an error occurred
 * @param error - The error object that was thrown
 * @param severity - Optional severity level for the alert (default is "error")
 */
export function useShowAlertOnError(isError: boolean, error: unknown, severity: AlertColor = "error") {
  const showApiErrorAlert = useApiErrorAlert(severity);

  useEffect(() => {
    if (isError) {
      showApiErrorAlert(error);
    }
  }, [isError, error, showApiErrorAlert]);
}
