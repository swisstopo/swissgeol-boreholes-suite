import { Typography } from "@mui/material";
import { Box, Stack } from "@mui/system";
import { CircleAlert, RotateCcw } from "lucide-react";
import { BoreholesButton } from "../../components/buttons/buttons.tsx";
import { DevError } from "./DevError.tsx";

export const FallbackComponent = ({
  error,
  resetErrorBoundary,
  title,
}: {
  error: Error;
  resetErrorBoundary: (() => void) | undefined;
  title: string;
}) => {
  const isDevelopment = process.env.NODE_ENV === "development";
  return (
    <Stack p={8} spacing={2}>
      <Stack direction="row" spacing={2}>
        <CircleAlert size={40} />
        <Typography variant="h4">{title}</Typography>
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
