/* eslint-disable  @typescript-eslint/no-explicit-any */
import { useCallback, useContext } from "react";
import { useTranslation } from "react-i18next";
import { ApiError } from "../api/apiInterfaces.ts";
import { AlertContext } from "../components/alert/alertContext.tsx";

export function useApiCallHandler() {
  const { t } = useTranslation();
  const { showAlert } = useContext(AlertContext);

  // Common function to handle API calls
  const executeApiCall = useCallback(
    async (apiFunc: (...args: any[]) => Promise<any>, args: any[], errorHandler: (error: unknown) => void) => {
      try {
        return await apiFunc(...args);
      } catch (error) {
        errorHandler(error);
      }
    },
    [],
  );

  const getErrorHandler = useCallback(
    (rollbackFunc = () => {}) =>
      (error: unknown) => {
        rollbackFunc();
        let errorMessage = t("errorWhileFetchingData");
        if (error instanceof ApiError && error.message) {
          errorMessage = t(error.message);
        }
        showAlert(errorMessage, "error");
      },
    [showAlert, t],
  );

  const handleApiCall = useCallback(
    (apiFunc: (...args: any[]) => Promise<any>, args: any[]) => {
      const errorHandler = getErrorHandler();
      return executeApiCall(apiFunc, args, errorHandler);
    },
    [executeApiCall, getErrorHandler],
  );

  const handleApiCallWithRollback = useCallback(
    (apiFunc: (...args: any[]) => Promise<any>, args: any[], rollbackFunc: () => void) => {
      const errorHandler = getErrorHandler(rollbackFunc);
      return executeApiCall(apiFunc, args, errorHandler);
    },
    [executeApiCall, getErrorHandler],
  );

  return { handleApiCall, handleApiCallWithRollback };
}
