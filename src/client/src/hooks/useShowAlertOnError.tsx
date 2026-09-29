import { useCallback, useContext, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { AlertColor } from "@mui/material";
import { ApiError } from "../api/errorClasses.ts";
import { AlertContext } from "../components/alert/alertContext.tsx";

export function useApiErrorAlert(severity: AlertColor = "error") {
  const { t } = useTranslation();
  const { showAlert } = useContext(AlertContext);

  return useCallback(
    (error: unknown) => {
      let errorMessage = t("errorWhileFetchingData");
      if (error instanceof ApiError) {
        // The key is preferred over the message, because a message is whatever sentence the API
        // happened to send and is not in the language the user reads.
        const key = error.messageKey ?? error.message;
        if (key) errorMessage = t(key, error.details);
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
