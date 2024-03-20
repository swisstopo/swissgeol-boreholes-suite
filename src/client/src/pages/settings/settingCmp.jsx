import { withTranslation } from "react-i18next";
import { Route, Switch } from "react-router-dom";
import { withRouter } from "react-router-dom";
import MenuSettings from "../../commons/menu/settings/menuSettings";
import MenuContainer from "../../commons/menu/menuContainer";
import ExplorerSettings from "./explorerSettings";
import EditorSettings from "./editorSettings";
import AdminSettings from "./admin/adminSettings";
import AboutSettings from "./aboutSettings";
import TermSettings from "./termSettings";

const SettingCmp = props => {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
      }}>
      <MenuContainer />
      <div
        style={{
          flex: "1 1 100%",
          display: "flex",
          flexDirection: "row",
          overflow: "hidden",
        }}>
        <div
          style={{
            boxShadow: "rgba(0, 0, 0, 0.17) 2px 6px 6px 0px",
            display: "flex",
            flexDirection: "column",
            width: "250px",
          }}>
          <MenuSettings mode={props.mode} />
        </div>
        <div
          style={{
            flex: "1 1 0%",
            overflowY: "auto",
          }}>
          <Switch>
            <Route component={ExplorerSettings} path={"/setting/explorer"} />
            <Route component={EditorSettings} path={"/setting/editor"} />
            <Route component={AdminSettings} path={"/setting/admin"} />
            <Route component={TermSettings} path={"/setting/term"} />
            <Route component={AboutSettings} path={"/setting/about"} />
          </Switch>
        </div>
      </div>
    </div>
  );
};

const SettingCmpWithTranslation = withRouter(withTranslation("common")(SettingCmp));
export default SettingCmpWithTranslation;
