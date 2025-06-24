import { FC, ReactNode, SyntheticEvent, useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { Box } from "@mui/system";
import { AddWorkgroupDialog } from "../../pages/settings/admin/dialogs/AddWorkgroupDialog.tsx";
import { AddButton } from "../buttons/buttons.tsx";
import {
  BoreholeTab,
  BoreholeTabContentBox,
  BoreholeTabs,
  TabsWithDivider,
  TabWithContent,
} from "../styledTabComponents.tsx";

export interface Tab {
  label: string;
  hash: string;
  component: ReactNode;
  hasContent?: boolean;
}

interface TabPanelProps {
  tabs: Tab[];
  variant?: "card" | "list";
}

export const TabPanel: FC<TabPanelProps> = ({ tabs, variant = "card" }) => {
  const navigate = useNavigate();
  const { pathname, hash } = useLocation();
  const [searchParams] = useSearchParams();
  const [activeIndex, setActiveIndex] = useState(0);
  const [workgroupDialogOpen, setWorkgroupDialogOpen] = useState(false);

  const { Tabs, Tab, TabContent } = useMemo(
    () =>
      variant === "list"
        ? { Tabs: TabsWithDivider, Tab: TabWithContent, TabContent: Box }
        : { Tabs: BoreholeTabs, Tab: BoreholeTab, TabContent: BoreholeTabContentBox },
    [variant],
  );

  // Initialize and update activeIndex based on the current URL hash
  useEffect(() => {
    const newActiveIndex = tabs.findIndex(tab => tab.hash === hash);
    if (newActiveIndex > -1) {
      setActiveIndex(newActiveIndex);
    } else {
      // Redirect to the first tab if hash is not valid
      navigate(
        {
          pathname: pathname,
          search: searchParams.toString(),
          hash: tabs[0].hash,
        },
        { replace: true },
      );
    }
  }, [navigate, tabs, hash, pathname, searchParams]);

  // Change handler for tab selection
  const handleIndexChange = (event: SyntheticEvent | null, index: number) => {
    if (hash !== tabs[index].hash) {
      navigate({
        pathname: pathname,
        search: searchParams.toString(),
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
      </Tabs>
      <TabContent>{tabs[activeIndex].component}</TabContent>
      <AddWorkgroupDialog open={workgroupDialogOpen} setOpen={setWorkgroupDialogOpen} />
    </>
  );
};
