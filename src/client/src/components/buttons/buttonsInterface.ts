import { ReactNode, Ref } from "react";
import { ButtonProps as MuiButtonProps } from "@mui/material/Button";

export interface ButtonProps extends MuiButtonProps {
  onClick: () => void;
  label?: string;
  icon?: ReactNode;
  dataCy?: string;
  ref?: Ref<HTMLButtonElement>;
}
