import { ReactElement } from "react";
import { Box } from "@mui/material";

export const AdministationTableWrapper = ({ children }): ReactElement => {
  return (
    <Box>
      <Box mb={0.5}></Box>
      {children}
    </Box>
  );
};
