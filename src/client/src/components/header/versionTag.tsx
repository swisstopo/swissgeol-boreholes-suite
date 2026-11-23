import { Box, Typography } from "@mui/material";
import { theme } from "../../AppTheme.ts";

const shortenedVersion = `${import.meta.env.VITE_APP_VERSION}`.split("+")[0];

export const VersionTag = () => (
  <Box>
    <Box>
      <Typography variant="caption" component="p" sx={{ color: theme.palette.action.disabled }}>
        {shortenedVersion}
      </Typography>
    </Box>
  </Box>
);
