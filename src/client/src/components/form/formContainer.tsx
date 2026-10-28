import { FC, ReactNode, Ref } from "react";
import { Stack, StackProps, Theme } from "@mui/material";
import { SystemStyleObject } from "@mui/system";

interface FormContainerProps extends Omit<StackProps, "sx"> {
  sx?: SystemStyleObject<Theme>;
  children?: ReactNode;
  width?: string;
  ref?: Ref<HTMLDivElement>;
  dataCy?: string;
}

export const FormContainer: FC<FormContainerProps> = ({ ref, ...props }) => {
  const width = props.width ?? "100%";
  return (
    <Stack
      component={props.component ?? "div"}
      ref={ref}
      data-cy={props.dataCy}
      {...props}
      rowGap={props.rowGap ?? 3}
      columnGap={2}
      sx={{ ...props.sx, width: width }}>
      {props.children}
    </Stack>
  );
};
