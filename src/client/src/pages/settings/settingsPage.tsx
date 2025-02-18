import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import { Route, Switch } from "react-router-dom";
import { Stack } from "@mui/material";
import { ReduxRootState, User } from "../../api-lib/ReduxStateInterfaces.ts";
import { theme } from "../../AppTheme.ts";
import { useAuth } from "../../auth/useBdmsAuth.tsx";
import { TabPanel } from "../../components/tabs/tabPanel.tsx";
import AboutSettings from "./aboutSettings";
import AdminSettings from "./admin/adminSettings";
import { UserAdministration } from "./admin/userAdministration.tsx";
import { UserAdministrationProvider } from "./admin/userAdministrationContext.tsx";
import { UserDetail } from "./admin/userDetail.tsx";
import { WorkgroupAdministration } from "./admin/workgroupAdministration.tsx";
import { WorkgroupAdministrationProvider } from "./admin/workgroupAdministrationContext.tsx";
import EditorSettings from "./editorSettings.tsx";
import { SettingsHeader } from "./settingsHeader.tsx";
import TermSettings from "./termSettings";

export const SettingsPage = () => {
  const auth = useAuth();
  const { t } = useTranslation();
  const currentUser: User = useSelector((state: ReduxRootState) => state.core_user);
  const isAdminUser = currentUser.data.admin;
  const isAnonymousUser = auth.anonymousModeEnabled;

  const tabs = useMemo(() => {
    const tabsArray = [{ label: t("about"), hash: "about", component: <AboutSettings /> }];

    if (!isAnonymousUser) {
      tabsArray.unshift({ label: t("general"), hash: "general", component: <EditorSettings /> });
      tabsArray.push({ label: t("terms"), hash: "terms", component: <TermSettings /> });
    }
    if (isAdminUser) {
      tabsArray.unshift({ label: t("legacySettings"), hash: "legacysettings", component: <AdminSettings /> });
      tabsArray.unshift({
        label: t("workgroups"),
        hash: "workgroups",
        component: <WorkgroupAdministration />,
      });
      tabsArray.unshift({
        label: t("users"),
        hash: "users",
        component: <UserAdministration />,
      });
    }

    return tabsArray;
  }, [isAdminUser, isAnonymousUser, t]);

  return (
    <UserAdministrationProvider>
      <WorkgroupAdministrationProvider>
        <SettingsHeader />
        <Switch>
          <Route exact={false} key={4} path={"/setting/user/:id"} render={() => <UserDetail />} />
          <Route
            exact={false}
            key={4}
            path={"/setting"}
            render={() => (
              <Stack
                sx={{
                  height: "100%",
                  p: 5,
                  overflowY: "auto",
                  backgroundColor: theme.palette.background.lightgrey,
                }}>
                <TabPanel tabs={tabs} />
              </Stack>
            )}
          />
        </Switch>
      </WorkgroupAdministrationProvider>
    </UserAdministrationProvider>
  );
};
