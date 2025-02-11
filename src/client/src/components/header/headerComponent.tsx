import { useSelector } from "react-redux";
import { Box, Stack } from "@mui/material";
import { ReduxRootState, User } from "../../api-lib/ReduxStateInterfaces.ts";
import { theme } from "../../AppTheme.ts";
import { useAuth } from "../../auth/useBdmsAuth";
import { LanguagePopup } from "./languagePopup.tsx";
import { ProfilePopup } from "./profilePopup.tsx";
import { VersionTag } from "./versionTag.tsx";

const HeaderComponent = () => {
  const user: User = useSelector((state: ReduxRootState) => state.core_user);
  const auth = useAuth();

  return (
    <Stack
      direction="row"
      alignItems="center"
      sx={{
        borderBottom: "1px solid " + theme.palette.border.light,
        padding: "21.5px",
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
