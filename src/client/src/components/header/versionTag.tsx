import { Box, Typography } from "@mui/material";
import { theme } from "../../AppTheme.ts";

const shortenedVersion = `${import.meta.env.VITE_APP_VERSION}`.split("+")[0];

export const VersionTag = () => (
  <Box>
    <Box>
      <Typography sx={{ fontSize: "12px", color: theme.palette.action.disabled, lineHeight: "16px" }}>
        {shortenedVersion}
      </Typography>
    </Box>
  </Box>
);
