import { withTranslation } from "react-i18next";
import { Route, Switch, withRouter } from "react-router-dom";
import { Box } from "@mui/material";
import { useAuth } from "../../auth/useBdmsAuth";
import { DetailHeaderSettings } from "../detail/detailHeaderSettings";
import AboutSettings from "./aboutSettings";
import AdminSettings from "./admin/adminSettings";
import EditorSettings from "./editorSettings.tsx";
import MenuSettings from "./menuSettings";
import TermSettings from "./termSettings";

const SettingsPage = () => {
  const auth = useAuth();
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
      }}>
      <DetailHeaderSettings />
      <Box
        sx={{
          flex: "1 1 100%",
          display: "flex",
          flexDirection: "row",
          overflow: "hidden",
        }}>
        <Box
          sx={{
            boxShadow: 3,
            display: "flex",
            flexDirection: "column",
            width: "250px",
          }}>
          <MenuSettings />
        </Box>
        <Box
          sx={{
            flex: "1 1 0%",
            overflowY: "auto",
          }}>
          <Switch>
            <Route component={AdminSettings} path={"/setting/admin"} />
            <Route component={TermSettings} path={"/setting/term"} />
            <Route component={AboutSettings} path={"/setting/about"} />
            <Route component={auth.anonymousModeEnabled ? AboutSettings : EditorSettings} path={"/setting"} />
          </Switch>
        </Box>
      </Box>
    </Box>
  );
};

const SettingsPageWithTranslation = withRouter(withTranslation("common")(SettingsPage));
export default SettingsPageWithTranslation;
