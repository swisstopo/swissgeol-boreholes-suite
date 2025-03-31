import { useContext, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { ApiError } from "../api/apiInterfaces.ts";
import { AlertContext } from "../components/alert/alertContext.tsx";

/**
 * Custom hook to display error messages when an API error occurs
 *
 * @param isError - Boolean flag indicating if an error occurred
 * @param error - The error object that was thrown
 */
export function useShowAlertOnError(isError: boolean, error: unknown) {
  const { t } = useTranslation();
  const { showAlert } = useContext(AlertContext);

  useEffect(() => {
    if (isError) {
      let errorMessage = t("errorWhileFetchingData");
      if (error instanceof ApiError && error.message) {
        errorMessage = t(error.message);
      }
      showAlert(errorMessage, "error");
    }
  }, [isError, error, showAlert, t]);
}
