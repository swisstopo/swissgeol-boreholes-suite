import { Box, Stack } from "@mui/material";
import { useCurrentUser } from "../../api/user.ts";
import { theme } from "../../AppTheme.ts";
import { useAuth } from "../../auth/useBoreholesAuth.tsx";
import { LanguagePopup } from "./languagePopup.tsx";
import { ProfilePopup } from "./profilePopup.tsx";
import { VersionTag } from "./versionTag.tsx";

const HeaderComponent = () => {
  const { data: user } = useCurrentUser();
  const auth = useAuth();

  return (
    <Stack
      direction="row"
      alignItems="center"
      sx={{
        borderBottom: "1px solid " + theme.palette.border.light,
        padding: "21.5px",
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
        {!auth.anonymousModeEnabled && <ProfilePopup user={user} />}
      </Stack>
    </Stack>
  );
};

export default HeaderComponent;
