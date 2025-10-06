import { FC, ReactNode, SyntheticEvent, useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router";
import { IconButton } from "@mui/material";
import { Box } from "@mui/system";
import { Maximize2 } from "lucide-react";
import { useBoreholesNavigate } from "../../hooks/useBoreholesNavigate.tsx";
import { AddWorkgroupDialog } from "../../pages/settings/admin/dialogs/AddWorkgroupDialog.tsx";
import { AddButton } from "../buttons/buttons.tsx";
import {
  BoreholeListTabContent,
  BoreholeTab,
  BoreholeTabContent,
  BoreholeTabs,
  TabsWithDivider,
  TabWithContent,
} from "../styledTabComponents.tsx";
import { TabModal } from "./tabModal.tsx";

export interface Tab {
  label: string;
  hash: string;
  component: ReactNode;
  hasContent?: boolean;
}

interface TabPanelProps {
  tabs: Tab[];
  variant?: "card" | "list";
  supportFullscreen?: boolean;
  title?: string;
}

export const TabPanel: FC<TabPanelProps> = ({ tabs, variant = "card", supportFullscreen, title }) => {
  const { navigateTo } = useBoreholesNavigate();
  const { hash } = useLocation();
  const [activeIndex, setActiveIndex] = useState(0);
  const [workgroupDialogOpen, setWorkgroupDialogOpen] = useState(false);
  const [showFullscreen, setShowFullscreen] = useState(false);

  const { Tabs, Tab, TabContent } = useMemo(
    () =>
      variant === "list"
        ? { Tabs: TabsWithDivider, Tab: TabWithContent, TabContent: BoreholeListTabContent }
        : { Tabs: BoreholeTabs, Tab: BoreholeTab, TabContent: BoreholeTabContent },
    [variant],
  );

  // Initialize and update activeIndex based on the current URL hash
  useEffect(() => {
    const newActiveIndex = tabs.findIndex(tab => hash.includes(tab.hash));
    if (newActiveIndex > -1) {
      setActiveIndex(newActiveIndex);
    } else {
      // Redirect to the first tab if hash is not valid
      navigateTo({
        hash: tabs[0].hash,
        replace: true,
      });
    }
  }, [navigateTo, tabs, hash]);

  // Change handler for tab selection
  const handleIndexChange = (event: SyntheticEvent | null, index: number) => {
    if (hash !== tabs[index].hash) {
      navigateTo({
        hash: tabs[index].hash,
      });
    }
  };

  const addWorkgroup = () => {
    setWorkgroupDialogOpen(true);
  };

  return (
    <>
      <Tabs value={activeIndex} onChange={handleIndexChange}>
        {tabs.map(tab => (
          <Tab
            data-cy={`${tab.hash.replace("#", "")}-tab`}
            label={tab.label}
            key={tab.hash}
            hasContent={tab.hasContent}
          />
        ))}
        <Box sx={{ flexGrow: 1 }}></Box>
        {hash === "#workgroups" && <AddButton label={"addWorkgroup"} variant={"contained"} onClick={addWorkgroup} />}
        {supportFullscreen && (
          <IconButton
            color="primaryInverse"
            data-cy="showFullscreenTabs"
            onClick={() => setShowFullscreen(true)}
            sx={{
              width: "36px",
              height: "36px",
              borderRadius: "2px",
            }}>
            <Maximize2 />
          </IconButton>
        )}
      </Tabs>
      <TabContent>{tabs[activeIndex].component}</TabContent>
      <AddWorkgroupDialog open={workgroupDialogOpen} setOpen={setWorkgroupDialogOpen} />
      <TabModal
        open={showFullscreen}
        onClose={() => setShowFullscreen(false)}
        title={title || ""}
        tabs={tabs}
        activeIndex={activeIndex}
        setActiveIndex={setActiveIndex}
      />
    </>
  );
};
