import { ButtonProps as MuiButtonProps } from "@mui/material/Button";
import * as React from "react";

export interface ButtonProps extends MuiButtonProps {
  onClick: () => void;
  label?: string;
  icon?: React.ReactNode;
}
