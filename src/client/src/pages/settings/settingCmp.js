import React from "react";
import { withTranslation } from "react-i18next";
import { Route, Switch } from "react-router-dom";
import { withRouter } from "react-router-dom";
import MenuSettings from "../../commons/menu/settings/menuSettings";
import MenuContainer from "../../commons/menu/menuContainer";
import ExplorerSettings from "./explorerSettings";
import EditorSettings from "./editorSettings";
import AdminSettings from "./admin/adminSettings";
import DatabaseSettings from "./databaseSettings";
import AboutSettings from "./aboutSettings";
import TermSettings from "./termSettings";
import LoginScreen from "./loginScreen";

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
          <MenuSettings />
        </div>
        <div
          style={{
            flex: "1 1 0%",
            overflowY: "auto",
          }}>
          <Switch>
            <Route
              component={ExplorerSettings}
              path={process.env.PUBLIC_URL + "/setting/explorer"}
            />
            <Route
              component={EditorSettings}
              path={process.env.PUBLIC_URL + "/setting/editor"}
            />
            <Route
              component={AdminSettings}
              path={process.env.PUBLIC_URL + "/setting/admin"}
            />
            <Route
              component={TermSettings}
              path={process.env.PUBLIC_URL + "/setting/term"}
            />
            <Route
              component={LoginScreen}
              path={process.env.PUBLIC_URL + "/setting/login"}
            />
            <Route
              component={DatabaseSettings}
              path={process.env.PUBLIC_URL + "/setting/database"}
            />
            <Route
              component={AboutSettings}
              path={process.env.PUBLIC_URL + "/setting/about"}
            />
          </Switch>
        </div>
      </div>
    </div>
  );
};

export default withRouter(withTranslation("common")(SettingCmp));
