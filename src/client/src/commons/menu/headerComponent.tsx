import { Box, Stack } from "@mui/material";
import { theme } from "../../AppTheme";
import { VersionTag } from "./versionTag";
import { ProfilePopup } from "./profilePopup";
import { ReduxRootState, User } from "../../api-lib/ReduxStateInterfaces";
import { useSelector } from "react-redux";
import { LanguagePopup } from "./languagePopup.tsx";

const HeaderComponent = () => {
  const user: User = useSelector((state: ReduxRootState) => state.core_user);

  return (
    <Stack
      direction="row"
      alignItems="center"
      sx={{
        borderBottom: "1px solid " + theme.palette.boxShadow,
        height: "88px",
        padding: "16px",
        zIndex: "10",
      }}>
      <Box sx={{ flex: "1 1 100%", padding: 0 }}>
        <img
          alt="Swiss Logo"
          src={"/swissgeol_boreholes.svg"}
          style={{
            height: "39px",
            width: "auto",
          }}
        />
      </Box>
      <Stack direction="row" alignItems="center" spacing={4}>
        <VersionTag />
        <LanguagePopup />
        <ProfilePopup user={user.data} />
      </Stack>
    </Stack>
  );
};

export default HeaderComponent;
