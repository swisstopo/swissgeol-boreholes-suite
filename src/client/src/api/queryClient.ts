import { AlertColor } from "@mui/material";
import { MutationCache, QueryCache, QueryClient } from "@tanstack/react-query";
import { ApiError } from "./errorClasses.ts";
import { isAbortError } from "./transferProgress.ts";

/**
 * The parts of the app the query client reports failures through. They are passed as
 * accessors rather than values so the client survives a language change without being
 * rebuilt, and so a test can observe what the user would have been told.
 */
export interface QueryClientDependencies {
  showAlert: (message: string, severity: AlertColor) => void;
  translate: (key: string) => string;
  retryQueries: boolean;
}

/**
 * Builds the app wide query client, including how failed queries and mutations are
 * reported to the user.
 * @param dependencies How to reach the user and whether failed queries are retried.
 * @returns The configured query client.
 */
export const createQueryClient = ({ showAlert, translate, retryQueries }: QueryClientDependencies): QueryClient =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: retryQueries ? 3 : false,
        throwOnError: (error, query) => {
          if (error instanceof ApiError && error.status === 404) {
            return true;
          }
          if (error instanceof ApiError) {
            return false;
          }
          // If there is no cached data for a query, we want to throw an error that will be caught by the error boundary.
          // The closest error boundary's FallbackComponent will be displayed.
          return typeof query.state.data === "undefined";
        },
      },
    },
    queryCache: new QueryCache({
      onError: (error, query) => {
        if (typeof query.state.data !== "undefined" && !(error instanceof ApiError)) {
          // If there is cached data available for a query, we want to show the cached data to the user.
          // An alert will be shown to inform the user that the data is not up-to-date.
          showAlert(translate("dataNotUpToDateError"), "error");
        }
      },
    }),
    mutationCache: new MutationCache({
      onError: error => {
        // Giving up on a transfer rejects the mutation that carried it, but the user asked for
        // that and the caller handles what it leaves behind, so it is not reported as a failure.
        if (!(error instanceof ApiError) && !isAbortError(error)) {
          // An alert will be shown to inform the user that the action was not successful.
          showAlert(translate("errorMutationNotSuccessfull"), "error");
        }
      },
    }),
  });
