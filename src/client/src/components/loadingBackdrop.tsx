import { FC, ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { Backdrop, BackdropProps, CircularProgress, IconButton, Stack, Typography } from "@mui/material";
import { X } from "lucide-react";
import { theme } from "../AppTheme.ts";

interface LoadingBackdropProps extends BackdropProps {
  message?: ReactNode;
  hint?: ReactNode; /** Explains how to get out of the running operation. Only shown together with a message. */
  onCancel?: () => void; /** Stops the running operation. Reachable by clicking the scrim or the cancel button. */
}

/**
 * Width of the status surface. Fixed rather than fitted to its content to keep UI calm.
 */
const statusWidth = "440px";

const riseIn = {
  "@keyframes riseIn": {
    from: { opacity: 0, transform: "translateY(4px)" },
    to: { opacity: 1, transform: "translateY(0)" },
  },
  animation: "riseIn 160ms ease-out",
};

export const LoadingBackdrop: FC<LoadingBackdropProps> = ({ message, hint, onCancel, sx, ...rest }) => {
  const { t } = useTranslation();

  return (
    <Backdrop
      {...rest}
      onClick={onCancel}
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
            width: statusWidth,
            maxWidth: `calc(100% - ${theme.spacing(4)})`,
            boxSizing: "border-box",
            borderRadius: theme.spacing(0.5),
            border: `1px solid ${theme.palette.border.light}`,
            backgroundColor: theme.palette.background.default,
            boxShadow: theme.shadows[3],
            ...riseIn,
          }}>
          <CircularProgress color="inherit" size={20} thickness={4.5} sx={{ flexShrink: 0 }} />
          <Stack spacing={0.25} sx={{ minWidth: 0, flexGrow: 1 }}>
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
          {onCancel && (
            // The scrim swallows the click that cancels, which leaves no target for keyboard and
            // screen reader users. This button gives that same action a focusable control.
            <IconButton
              size="small"
              aria-label={t("cancel")}
              data-cy="loading-backdrop-cancel"
              onClick={event => {
                // The scrim below would otherwise cancel a second time.
                event.stopPropagation();
                onCancel();
              }}
              sx={{ flexShrink: 0, color: theme.palette.primary.main }}>
              <X size={18} />
            </IconButton>
          )}
        </Stack>
      ) : (
        <CircularProgress color="inherit" />
      )}
    </Backdrop>
  );
};
