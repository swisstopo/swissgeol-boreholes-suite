import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import { Route, Switch } from "react-router-dom";
import { Stack } from "@mui/material";
import { ReduxRootState, User } from "../../api-lib/ReduxStateInterfaces.ts";
import { User as UserV2 } from "../../api/apiInterfaces.ts";
import { theme } from "../../AppTheme.ts";
import { useAuth } from "../../auth/useBdmsAuth.tsx";
import { TabPanel } from "../../components/tabs/tabPanel.tsx";
import AboutSettings from "./aboutSettings";
import AdminSettings from "./admin/adminSettings";
import { UserDetail } from "./admin/userDetail.tsx";
import { UserTable } from "./admin/userTable.tsx";
import { WorkgroupTable } from "./admin/workgroupTable.tsx";
import EditorSettings from "./editorSettings.tsx";
import { SettingsHeader } from "./settingsHeader.tsx";
import TermSettings from "./termSettings";

export const SettingsPage = () => {
  const auth = useAuth();
  const { t } = useTranslation();
  const currentUser: User = useSelector((state: ReduxRootState) => state.core_user);
  const [selectedUser, setSelectedUser] = useState<UserV2 | null>(null);
  const [users, setUsers] = useState<UserV2[]>([]);

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
        component: <WorkgroupTable />,
      });
      tabsArray.unshift({
        label: t("users"),
        hash: "users",
        component: <UserTable setSelectedUser={setSelectedUser} users={users} setUsers={setUsers} />,
      });
    }

    return tabsArray;
  }, [isAdminUser, isAnonymousUser, t, users]);

  return (
    <>
      <SettingsHeader selectedUser={selectedUser} setSelectedUser={setSelectedUser} users={users} setUsers={setUsers} />
      <Switch>
        <Route
          exact={false}
          key={4}
          path={"/setting/user/:id"}
          render={() => <UserDetail user={selectedUser} setUser={setSelectedUser} />}
        />
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
    </>
  );
};
