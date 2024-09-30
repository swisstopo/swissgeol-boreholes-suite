import { forwardRef, ReactNode } from "react";
import { Stack, StackProps } from "@mui/material";

interface FormContainerProps extends StackProps {
  children?: ReactNode;
  width?: string;
}

export const FormContainer = forwardRef<ReactNode, FormContainerProps>((props, ref) => {
  const width = props.width || "100%";
  return (
    <Stack component={props.component || "div"} ref={ref} {...props} rowGap={3} columnGap={2} sx={{ width: width }}>
      {props.children}
    </Stack>
  );
});
