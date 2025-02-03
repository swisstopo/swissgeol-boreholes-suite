import { SyntheticEvent, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useHistory, useLocation } from "react-router-dom";
import { Box } from "@mui/material";
import { theme } from "../../AppTheme.ts";
import { BdmsTab, BdmsTabContentBox, BdmsTabs } from "../../components/styledTabComponents.js";
import { DetailHeaderSettings } from "../detail/detailHeaderSettings";
import AboutSettings from "./aboutSettings";
import AdminSettings from "./admin/adminSettings";
import EditorSettings from "./editorSettings.tsx";
import TermSettings from "./termSettings";

export const SettingsPage = () => {
  //const auth = useAuth();
  const location = useLocation();
  const history = useHistory();
  const { t } = useTranslation();

  const [activeIndex, setActiveIndex] = useState(0);

  // TODO auth check for admin
  const tabs = useMemo(
    () => [
      { label: t("workgroups"), hash: "workgroups" },
      { label: t("general"), hash: "general" },
      { label: t("about"), hash: "about" },
      { label: t("terms"), hash: "terms" },
    ],
    [t],
  );

  const handleIndexChange = (event: SyntheticEvent | null, index: number) => {
    const newLocation = location.pathname + "#" + tabs[index].hash;
    if (location.pathname + location.hash !== newLocation) {
      history.push(newLocation);
    }
  };

  // Update active tab index based on hash
  useEffect(() => {
    if (!location.hash) {
      history.replace(location.pathname + "#" + tabs[activeIndex].hash);
    } else {
      const newTabIndex = tabs.findIndex(t => t.hash === location.hash.replace("#", ""));
      if (newTabIndex > -1) {
        setActiveIndex(newTabIndex);
      }
    }
  }, [activeIndex, history, location.hash, location.pathname, tabs]);

  return (
    <>
      <DetailHeaderSettings />
      <Box
        sx={{
          height: "100%",
          display: "flex",
          flex: "1 1 100%",
          flexDirection: "column",
          px: 5,
          py: 5,
          overflowY: "auto",
          backgroundColor: theme.palette.background.lightgrey,
        }}>
        <BdmsTabs value={activeIndex} onChange={handleIndexChange}>
          {tabs.map(tab => {
            return <BdmsTab data-cy={tab.hash + "-tab"} label={tab.label} key={tab.hash} />;
          })}
        </BdmsTabs>
        <BdmsTabContentBox flex="1 0 0">
          {activeIndex === 0 && <AdminSettings />}
          {activeIndex === 1 && <EditorSettings />}
          {activeIndex === 2 && <AboutSettings />}
          {activeIndex === 3 && <TermSettings />}
        </BdmsTabContentBox>
      </Box>
    </>
  );
};
