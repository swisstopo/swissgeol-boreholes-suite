/* eslint-disable  @typescript-eslint/no-explicit-any */
import { useCallback, useContext } from "react";
import { useTranslation } from "react-i18next";
import { ApiError } from "../api/apiInterfaces.ts";
import { AlertContext } from "../components/alert/alertContext.tsx";

/**
 * Custom hook to handle API requests with error handling and rollback functionality.
 *
 * This hook provides two main functions:
 * - `callApiWithErrorHandling`: Executes an API function and handles any errors that occur.
 * - `callApiWithRollback`: Executes an API function, handles errors, and performs a rollback if the API call fails.
 *
 * @returns {Object} An object containing the `callApiWithErrorHandling` and `callApiWithRollback` functions.
 */
export function useApiRequest() {
  const { t } = useTranslation();
  const { showAlert } = useContext(AlertContext);

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

  /**
   * Executes an API function and handles any errors that occur.
   *
   * @param {Function} apiFunc - The API function to be called.
   * @param {Array} args - The arguments to be passed to the API function.
   * @returns {Promise<any>} The result of the API call.
   */
  const callApiWithErrorHandling = useCallback(
    (apiFunc: (...args: any[]) => Promise<any>, args: any[]) => {
      const onError: (error: unknown) => void = createErrorHandler();
      return callApi(apiFunc, args, onError);
    },
    [callApi, createErrorHandler],
  );

  /**
   * Executes an API function, handles errors, and performs a rollback if the API call fails.
   *
   * @param {Function} apiFunc - The API function to be called.
   * @param {Array} args - The arguments to be passed to the API function.
   * @param {Function} rollbackFunc - The rollback function to be called if an error occurs.
   * @returns {Promise<any>} The result of the API call.
   */
  const callApiWithRollback = useCallback(
    (apiFunc: (...args: any[]) => Promise<any>, args: any[], rollbackFunc: () => void) => {
      const onError: (error: unknown) => void = createErrorHandler(rollbackFunc);
      return callApi(apiFunc, args, onError);
    },
    [callApi, createErrorHandler],
  );

  return { callApiWithErrorHandling, callApiWithRollback };
}
