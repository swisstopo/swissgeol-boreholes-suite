import { forwardRef } from "react";
import { TextField } from "@mui/material";

export const FormField = forwardRef((props, ref) => {
  return <TextField ref={ref} {...props} size="small" variant="filled" />;
});
