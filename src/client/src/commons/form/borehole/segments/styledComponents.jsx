import { Radio } from "@mui/material";

export const DisabledRadio = ({ isEditable, ...props }) => {
  return (
    <Radio
      disabled={!isEditable}
      sx={{
        "&.Mui-disabled input": {
          zIndex: -1,
        },
      }}
      {...props}
    />
  );
};
