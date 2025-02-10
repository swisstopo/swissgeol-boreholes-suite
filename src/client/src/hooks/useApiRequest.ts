/* eslint-disable  @typescript-eslint/no-explicit-any */
import { useCallback, useContext } from "react";
import { useTranslation } from "react-i18next";
import { ApiError } from "../api/apiInterfaces.ts";
import { AlertContext } from "../components/alert/alertContext.tsx";

// doc

export function useApiRequest() {
  const { t } = useTranslation();
  const { showAlert } = useContext(AlertContext);

  // Common function to handle API calls
  const callApi = useCallback(
    async (apiFunc: (...args: any[]) => Promise<any>, args: any[], onError: (error: unknown) => void) => {
      try {
        return await apiFunc(...args);
      } catch (error) {
        onError(error);
      }
    },
    [],
  );

  const createErrorHandler = useCallback(
    (onRollback = () => {}) =>
      (error: unknown) => {
        onRollback();
        // Fallback error message if error thrown is not of type ApiError or does not contain a message
        let errorMessage = t("errorWhileFetchingData");
        if (error instanceof ApiError && error.message) {
          errorMessage = t(error.message);
        }
        showAlert(errorMessage, "error");
      },
    [showAlert, t],
  );

  const callApiWithErrorHandling = useCallback(
    (apiFunc: (...args: any[]) => Promise<any>, args: any[]) => {
      const onError: (error: unknown) => void = createErrorHandler();
      return callApi(apiFunc, args, onError);
    },
    [callApi, createErrorHandler],
  );

  const callApiWithRollback = useCallback(
    (apiFunc: (...args: any[]) => Promise<any>, args: any[], rollbackFunc: () => void) => {
      const onError: (error: unknown) => void = createErrorHandler(rollbackFunc);
      return callApi(apiFunc, args, onError);
    },
    [callApi, createErrorHandler],
  );

  return { callApiWithErrorHandling, callApiWithRollback };
}
