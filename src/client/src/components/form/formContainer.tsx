import { FC, ReactNode, Ref } from "react";
import { Stack, StackProps } from "@mui/material";

interface FormContainerProps extends StackProps {
  children?: ReactNode;
  width?: string;
  ref?: Ref<HTMLDivElement>;
}

export const FormContainer: FC<FormContainerProps> = props => {
  const width = props.width ?? "100%";
  return (
    <Stack
      component={props.component ?? "div"}
      ref={props.ref}
      {...props}
      rowGap={3}
      columnGap={2}
      sx={{ ...props.sx, width: width }}>
      {props.children}
    </Stack>
  );
};
