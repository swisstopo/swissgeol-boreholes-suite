import { forwardRef } from "react";
import { TextField } from "@mui/material";

export const FormField = forwardRef((props, ref) => {
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
