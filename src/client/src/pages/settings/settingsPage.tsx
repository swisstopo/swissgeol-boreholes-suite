import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import { Route, Routes } from "react-router";
import { Stack } from "@mui/material";
import { ReduxRootState, User } from "../../api-lib/ReduxStateInterfaces.ts";
import { theme } from "../../AppTheme.ts";
import { useAuth } from "../../auth/useBdmsAuth.tsx";
import { TabPanel } from "../../components/tabs/tabPanel.tsx";
import { AboutSettings } from "./aboutSettings.tsx";
import { UserAdministration } from "./admin/userAdministration.tsx";
import { UserAdministrationProvider } from "./admin/userAdministrationContext.tsx";
import { UserDetail } from "./admin/userDetail.tsx";
import { WorkgroupAdministration } from "./admin/workgroupAdministration.tsx";
import { WorkgroupAdministrationProvider } from "./admin/workgroupAdministrationContext.tsx";
import { WorkgroupDetail } from "./admin/workgroupDetail.tsx";
import GeneralSettings from "./generalSettings.tsx";
import { SettingsHeader } from "./settingsHeader.tsx";
import TermSettings from "./termSettings";

export const SettingsPage = () => {
  const auth = useAuth();
  const { t } = useTranslation();
  const currentUser: User = useSelector((state: ReduxRootState) => state.core_user);
  const isAdminUser = currentUser.data.admin;
  const isAnonymousUser = auth.anonymousModeEnabled;

  const tabs = useMemo(() => {
    const tabsArray = [{ label: t("about"), hash: "#about", component: <AboutSettings /> }];

    if (!isAnonymousUser) {
      tabsArray.unshift({ label: t("general"), hash: "#general", component: <GeneralSettings /> });
      tabsArray.push({ label: t("terms"), hash: "#terms", component: <TermSettings /> });
    }
    if (isAdminUser) {
      tabsArray.unshift({
        label: t("workgroups"),
        hash: "#workgroups",
        component: <WorkgroupAdministration />,
      });
      tabsArray.unshift({
        label: t("users"),
        hash: "#users",
        component: <UserAdministration />,
      });
    }

    return tabsArray;
  }, [isAdminUser, isAnonymousUser, t]);

  return (
    <UserAdministrationProvider>
      <WorkgroupAdministrationProvider>
        <SettingsHeader />
        <Routes>
          <Route path="user/:id" element={<UserDetail />} />
          <Route path="workgroup/:id" element={<WorkgroupDetail />} />
          <Route
            path=""
            element={
              <Stack
                sx={{
                  height: "100%",
                  p: 5,
                  overflowY: "auto",
                  backgroundColor: theme.palette.background.lightgrey,
                }}>
                <TabPanel tabs={tabs} />
              </Stack>
            }
          />
        </Routes>
      </WorkgroupAdministrationProvider>
    </UserAdministrationProvider>
  );
};
