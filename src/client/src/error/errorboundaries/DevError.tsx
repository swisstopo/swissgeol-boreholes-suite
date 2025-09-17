import { Typography } from "@mui/material";
import { Box } from "@mui/system";

export const DevError = ({ error }: { error: Error }) => {
  return (
    <Box>
      <Typography>Error Name: {error.name}</Typography>
      <Typography>Error Message:{error.message}</Typography>
      <Typography>Error Stack:{error.stack}</Typography>
    </Box>
  );
};
