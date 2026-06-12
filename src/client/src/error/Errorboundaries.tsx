import { ComponentType, FC, PropsWithChildren } from "react";
import { ErrorBoundary, FallbackProps } from "react-error-boundary";
import { useTranslation } from "react-i18next";
import { useLocation, useNavigate } from "react-router";
import { Typography } from "@mui/material";
import { Box, Stack } from "@mui/system";
import { ChevronLeft, CircleAlert, RotateCcw } from "lucide-react";
import { ApiError, InvalidRouteParamError } from "../api/errorClasses.ts";
import { BoreholesButton } from "../components/buttons/buttons.tsx";

const DevError = ({ error }: { error: unknown }) => {
  if (error instanceof Error) {
    return (
      <Box>
        <Typography>Error Name: {error.name}</Typography>
        <Typography>Error Message:{error.message}</Typography>
        <Typography>Error Stack:{error.stack}</Typography>
      </Box>
    );
  }
  return (
    <Box>
      <Typography>Error: {String(error)}</Typography>
    </Box>
  );
};

const BackToOverviewWithMessage = ({ message }: { message: string }) => {
  const navigate = useNavigate();

  return (
    <Stack p={8} spacing={2}>
      <Typography variant="h4">{message}</Typography>
      <Box>
        <BoreholesButton
          label="backToOverview"
          variant="contained"
          // The route-level boundary (RouteErrorBoundary) is keyed to the location and resets
          // itself when the path changes, so navigating away is enough to clear the error.
          // No manual reset/setTimeout is needed, which avoids racing react-router navigation.
          onClick={() => navigate("/", { replace: true })}
          startIcon={<ChevronLeft />}
        />
      </Box>
    </Stack>
  );
};

const FallbackComponent = ({
  error,
  resetErrorBoundary,
  title,
}: {
  error: unknown;
  resetErrorBoundary: (() => void) | undefined;
  title: string;
}) => {
  const { t } = useTranslation();
  const isDevelopment = process.env.NODE_ENV === "development";

  if (error instanceof InvalidRouteParamError) {
    return <BackToOverviewWithMessage message={error.userMessage} />;
  }

  if (error instanceof ApiError && error.status === 404) {
    return <BackToOverviewWithMessage message={t("boreholeNotFound")} />;
  }

  return (
    <Stack p={8} spacing={2}>
      <Stack direction="row" spacing={2}>
        <CircleAlert size={40} />
        <Typography variant="h4">{t(title)}</Typography>
      </Stack>
      {isDevelopment && <DevError error={error} />}
      <Box>
        {resetErrorBoundary && (
          <BoreholesButton label={"retry"} variant={"contained"} onClick={resetErrorBoundary} icon={<RotateCcw />} />
        )}
      </Box>
    </Stack>
  );
};

interface ErrorFallbackProps {
  error: unknown;
  resetErrorBoundary?: () => void;
}

/**
 * Wraps a route element in an ErrorBoundary keyed to the current path, so navigating away
 * resets the error in the same render that swaps in the new route.
 */
export const RouteErrorBoundary: FC<PropsWithChildren<{ fallback: ComponentType<FallbackProps> }>> = ({
  fallback,
  children,
}) => {
  const { pathname } = useLocation();
  return (
    <ErrorBoundary FallbackComponent={fallback} resetKeys={[pathname]}>
      {children}
    </ErrorBoundary>
  );
};

export const GlobalError: FC<ErrorFallbackProps> = ({ error, resetErrorBoundary }) => {
  return <FallbackComponent error={error} resetErrorBoundary={resetErrorBoundary} title={"globalErrorMessage"} />;
};

export const DetailError: FC<ErrorFallbackProps> = ({ error, resetErrorBoundary }) => {
  return <FallbackComponent error={error} resetErrorBoundary={resetErrorBoundary} title={"detailErrorMessage"} />;
};

export const OverviewError: FC<ErrorFallbackProps> = ({ error, resetErrorBoundary }) => {
  return <FallbackComponent error={error} resetErrorBoundary={resetErrorBoundary} title={"overviewErrorMessage"} />;
};

export const SettingsError: FC<ErrorFallbackProps> = ({ error, resetErrorBoundary }) => {
  return <FallbackComponent error={error} resetErrorBoundary={resetErrorBoundary} title={"settingsErrorMessage"} />;
};
