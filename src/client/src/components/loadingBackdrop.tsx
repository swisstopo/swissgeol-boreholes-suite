import { FC } from "react";
import { Backdrop, BackdropProps, CircularProgress } from "@mui/material";
import { theme } from "../AppTheme.ts";

export const LoadingBackdrop: FC<BackdropProps> = ({ sx, ...rest }) => (
  <Backdrop
    {...rest}
    sx={{
      color: theme.palette.primary.main,
      backgroundColor: theme.palette.background.backdrop,
      ...sx,
    }}>
    <CircularProgress color="inherit" />
  </Backdrop>
);
