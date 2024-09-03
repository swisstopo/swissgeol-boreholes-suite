import { Box, Stack } from "@mui/material";
import { theme } from "../../AppTheme.ts";
import { VersionTag } from "./versionTag.tsx";
import { ProfilePopup } from "./profilePopup.tsx";
import { ReduxRootState, User } from "../../api-lib/ReduxStateInterfaces.ts";
import { useSelector } from "react-redux";
import { LanguagePopup } from "./languagePopup.tsx";
import { useAuth } from "../../auth/useBdmsAuth";

const HeaderComponent = () => {
  const user: User = useSelector((state: ReduxRootState) => state.core_user);
  const auth = useAuth();

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
        {!auth.anonymousModeEnabled && <ProfilePopup user={user.data} />}
      </Stack>
    </Stack>
  );
};

export default HeaderComponent;
