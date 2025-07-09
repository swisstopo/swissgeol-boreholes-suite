import { FC, PropsWithChildren } from "react";
import { Box } from "@mui/material";

export const AdministrationTableWrapper: FC<PropsWithChildren> = ({ children }) => {
  return (
    <Box>
      <Box mb={0.5}></Box>
      {children}
    </Box>
  );
};
