import { FC } from "react";
import { useTranslation } from "react-i18next";
import { Typography } from "@mui/material";
import { Box, Stack } from "@mui/system";
import { CircleAlert, RotateCcw } from "lucide-react";
import { BoreholesButton } from "../components/buttons/buttons.tsx";

const DevError = ({ error }: { error: Error }) => {
  return (
    <Box>
      <Typography>Error Name: {error.name}</Typography>
      <Typography>Error Message:{error.message}</Typography>
      <Typography>Error Stack:{error.stack}</Typography>
    </Box>
  );
};

const FallbackComponent = ({
  error,
  resetErrorBoundary,
  title,
}: {
  error: Error;
  resetErrorBoundary: (() => void) | undefined;
  title: string;
}) => {
  const { t } = useTranslation();
  const isDevelopment = process.env.NODE_ENV === "development";
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
  error: Error;
  resetErrorBoundary?: () => void;
}

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
