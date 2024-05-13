import { Box, Stack } from "@mui/material";
import { theme } from "../../AppTheme";
import TranslationKeys from "../translationKeys";
import { VersionTag } from "./versionTag";

const HeaderComponent = () => {
  return (
    <Stack
      direction="row"
      sx={{
        boxShadow: theme.palette.boxShadow + " 0px 4px 12px",
        height: "5em",
        padding: "1em",
        zIndex: "10",
      }}>
      <Box sx={{ flex: "1 1 100%" }}>
        <img
          alt="Swiss Logo"
          src={"/swissgeol_boreholes.svg"}
          style={{
            height: "45px",
            width: "auto",
          }}
        />
      </Box>
      <Stack direction="row" alignItems="center" spacing={1}>
        <TranslationKeys />
        <VersionTag />
      </Stack>
    </Stack>
  );
};

export default HeaderComponent;
