import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import { Stack } from "@mui/material";
import { ReduxRootState, User } from "../../api-lib/ReduxStateInterfaces.ts";
import { theme } from "../../AppTheme.ts";
import { useAuth } from "../../auth/useBdmsAuth.tsx";
import { TabPanel } from "../../components/tabs/tabPanel.tsx";
import { DetailHeaderSettings } from "../detail/detailHeaderSettings";
import AboutSettings from "./aboutSettings";
import AdminSettings from "./admin/adminSettings";
import { UserTable } from "./admin/userTable.tsx";
import EditorSettings from "./editorSettings.tsx";
import TermSettings from "./termSettings";

export const SettingsPage = () => {
  const auth = useAuth();
  const { t } = useTranslation();
  const user: User = useSelector((state: ReduxRootState) => state.core_user);

  const isAdminUser = user.data.admin;
  const isAnonymousUser = auth.anonymousModeEnabled;

  const tabs = useMemo(() => {
    const tabsArray = [{ label: t("about"), hash: "about", component: <AboutSettings /> }];

    if (!isAnonymousUser) {
      tabsArray.unshift({ label: t("general"), hash: "general", component: <EditorSettings /> });
      tabsArray.push({ label: t("terms"), hash: "terms", component: <TermSettings /> });
    }
    if (isAdminUser) {
      tabsArray.unshift({ label: t("workgroups"), hash: "workgroups", component: <AdminSettings /> });
      tabsArray.unshift({ label: t("users"), hash: "users", component: <UserTable /> });
    }

    return tabsArray;
  }, [isAdminUser, isAnonymousUser, t]);

  return (
    <>
      <DetailHeaderSettings />
      <Stack
        sx={{
          height: "100%",
          p: 5,
          overflowY: "auto",
          backgroundColor: theme.palette.background.lightgrey,
        }}>
        <TabPanel tabs={tabs} />
      </Stack>
    </>
  );
};
