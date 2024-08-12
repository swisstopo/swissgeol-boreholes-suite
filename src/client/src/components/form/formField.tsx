import { ForwardedRef, forwardRef } from "react";
import { SxProps, TextField } from "@mui/material";

interface FormFieldProps {
  sx?: SxProps;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
}

export const FormField = forwardRef((props: FormFieldProps, ref: ForwardedRef<HTMLDivElement>) => {
  return (
    <TextField
      ref={ref}
      {...props}
      size="small"
      variant="filled"
      sx={{
        borderRadius: "4px",
        flex: "1",
        marginTop: "10px !important",
        marginRight: "10px !important",
        ...props.sx,
      }}
    />
  );
});
