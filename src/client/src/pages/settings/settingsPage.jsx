import { withTranslation } from "react-i18next";
import { Route, Switch, withRouter } from "react-router-dom";
import MenuSettings from "./menuSettings";
import EditorSettings from "./editorSettings";
import AdminSettings from "./admin/adminSettings";
import AboutSettings from "./aboutSettings";
import TermSettings from "./termSettings";
import { theme } from "../../AppTheme";
import { useAuth } from "../../auth/useBdmsAuth";

const SettingsPage = () => {
  const auth = useAuth();
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
      }}>
      <div
        style={{
          flex: "1 1 100%",
          display: "flex",
          flexDirection: "row",
          overflow: "hidden",
        }}>
        <div
          style={{
            boxShadow: theme.palette.boxShadow + " 2px 6px 6px 0px",
            display: "flex",
            flexDirection: "column",
            width: "250px",
          }}>
          <MenuSettings />
        </div>
        <div
          style={{
            flex: "1 1 0%",
            overflowY: "auto",
          }}>
          <Switch>
            <Route component={AdminSettings} path={"/setting/admin"} />
            <Route component={TermSettings} path={"/setting/term"} />
            <Route component={AboutSettings} path={"/setting/about"} />
            <Route component={auth.anonymousModeEnabled ? AboutSettings : EditorSettings} path={"/setting"} />
          </Switch>
        </div>
      </div>
    </div>
  );
};

const SettingsPageWithTranslation = withRouter(withTranslation("common")(SettingsPage));
export default SettingsPageWithTranslation;
