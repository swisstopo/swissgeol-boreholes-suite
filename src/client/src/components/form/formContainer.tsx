import { FC, ReactNode, Ref } from "react";
import { Stack, StackProps } from "@mui/material";

interface FormContainerProps extends StackProps {
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
