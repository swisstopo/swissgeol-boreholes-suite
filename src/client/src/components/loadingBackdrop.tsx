import { FC, ReactNode } from "react";
import { Backdrop, BackdropProps, CircularProgress, Stack, Typography } from "@mui/material";
import { theme } from "../AppTheme.ts";

interface LoadingBackdropProps extends BackdropProps {
  message?: ReactNode;
  hint?: ReactNode; /** Explains how to get out of the running operation. Only shown together with a message. */
}

const riseIn = {
  "@keyframes riseIn": {
    from: { opacity: 0, transform: "translateY(4px)" },
    to: { opacity: 1, transform: "translateY(0)" },
  },
  animation: "riseIn 160ms ease-out",
};

export const LoadingBackdrop: FC<LoadingBackdropProps> = ({ message, hint, sx, ...rest }) => (
  <Backdrop
    {...rest}
    sx={{
      color: theme.palette.primary.main,
      backgroundColor: theme.palette.background.backdrop,
      ...sx,
    }}>
    {message ? (
      // The scrim is translucent, so the status needs a surface of its own to stay readable
      // over whatever it covers.
      <Stack
        direction="row"
        alignItems="center"
        spacing={2}
        data-cy="loading-backdrop-status"
        sx={{
          px: 2.5,
          py: 2,
          maxWidth: `calc(100% - ${theme.spacing(4)})`,
          borderRadius: theme.spacing(0.5),
          border: `1px solid ${theme.palette.border.light}`,
          backgroundColor: theme.palette.background.default,
          boxShadow: theme.shadows[3],
          ...riseIn,
        }}>
        <CircularProgress color="inherit" size={20} thickness={4.5} sx={{ flexShrink: 0 }} />
        <Stack spacing={0.25} sx={{ minWidth: 0 }}>
          <Typography
            variant="body2"
            data-cy="loading-backdrop-message"
            sx={{
              fontWeight: 500,
              color: theme.palette.primary.main,
              // A file name is worth wrapping rather than truncating: it says what is transferring.
              overflowWrap: "anywhere",
            }}>
            {message}
          </Typography>
          {hint && (
            <Typography
              variant="subtitle2"
              data-cy="loading-backdrop-hint"
              // Keeps a counter that ticks upwards from shifting the text around it.
              sx={{ fontVariantNumeric: "tabular-nums" }}>
              {hint}
            </Typography>
          )}
        </Stack>
      </Stack>
    ) : (
      <CircularProgress color="inherit" />
    )}
  </Backdrop>
);
