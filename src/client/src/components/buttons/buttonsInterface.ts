import { ReactNode, Ref } from "react";
import { Theme } from "@mui/material";
import { ButtonProps as MuiButtonProps } from "@mui/material/Button";
import { SystemStyleObject } from "@mui/system";

export interface ButtonProps extends Omit<MuiButtonProps, "sx"> {
  sx?: SystemStyleObject<Theme>;
  onClick: () => void;
  label?: string;
  icon?: ReactNode;
  dataCy?: string;
  ref?: Ref<HTMLButtonElement>;
}
