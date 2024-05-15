import { Box, Chip } from "@mui/material";
import { theme } from "../../AppTheme";

const shortenedVersion = import.meta.env.VITE_APP_VERSION.split("+")[0];

export const VersionTag = () => (
  <Box>
    <Box
      style={{
        fontSize: "smaller",
      }}>
      <Chip sx={{ backgroundColor: theme.palette.background.lightgrey }} label={shortenedVersion} />
    </Box>
  </Box>
);
