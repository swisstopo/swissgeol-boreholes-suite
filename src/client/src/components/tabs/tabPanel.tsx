import { FC, ReactNode, SyntheticEvent, useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router";
import { Box } from "@mui/system";
import { Maximize2 } from "lucide-react";
import { useBoreholesNavigate } from "../../hooks/useBoreholesNavigate.tsx";
import { AddWorkgroupDialog } from "../../pages/settings/admin/dialogs/AddWorkgroupDialog.tsx";
import { AddButton, StandaloneIconButton } from "../buttons/buttons.tsx";
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

  const indexForHash = tabs.findIndex(tab => hash.includes(tab.hash));
  const firstTabHash = tabs[0].hash;

  // Initialize and update activeIndex based on the current URL hash.
  useEffect(() => {
    if (indexForHash > -1) {
      setActiveIndex(indexForHash);
    } else {
      // Redirect to the first tab if hash is not valid
      navigateTo({
        hash: firstTabHash,
        replace: true,
      });
    }
  }, [navigateTo, indexForHash, firstTabHash]);

  // Change handler for tab selection
  const handleIndexChange = (_event: SyntheticEvent | null, index: number) => {
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
          <StandaloneIconButton
            icon={<Maximize2 />}
            onClick={() => setShowFullscreen(true)}
            dataCy={"showFullscreenTabs"}
            color={"primaryInverse"}
          />
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
