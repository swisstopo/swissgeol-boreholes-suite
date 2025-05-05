import { ReactNode, SyntheticEvent, useEffect, useState } from "react";
import { useHistory, useLocation } from "react-router-dom";
import { Box } from "@mui/system";
import { AddWorkgroupDialog } from "../../pages/settings/admin/dialogs/AddWorkgroupDialog.tsx";
import { AddButton } from "../buttons/buttons.tsx";
import { BoreholeTab, BoreholeTabContentBox, BoreholeTabs } from "../styledTabComponents.tsx";

export interface Tab {
  label: string;
  hash: string;
  component: ReactNode;
  hasContent?: boolean;
}

export const TabPanel = ({ tabs }: { tabs: Tab[] }) => {
  const history = useHistory();
  const location = useLocation();
  const [activeIndex, setActiveIndex] = useState(0);
  const [workgroupDialogOpen, setWorkgroupDialogOpen] = useState(false);

  // Initialize and update activeIndex based on the current URL hash
  useEffect(() => {
    const currentHash = location.hash.replace("#", "");
    const newActiveIndex = tabs.findIndex(tab => tab.hash === currentHash);
    if (newActiveIndex > -1) {
      setActiveIndex(newActiveIndex);
    } else {
      // Redirect to the first tab if hash is not valid
      history.replace(`${location.pathname}#${tabs[0].hash}`);
    }
  }, [location, history, tabs]);

  // Change handler for tab selection
  const handleIndexChange = (event: SyntheticEvent | null, index: number) => {
    const newLocation = location.pathname + "#" + tabs[index].hash;
    if (location.pathname + location.hash !== newLocation) {
      history.push(newLocation);
    }
  };

  const addWorkgroup = () => {
    setWorkgroupDialogOpen(true);
  };

  return (
    <>
      <BoreholeTabs value={activeIndex} onChange={handleIndexChange}>
        {tabs.map(tab => (
          <BoreholeTab data-cy={`${tab.hash}-tab`} label={tab.label} key={tab.hash} hasContent={tab.hasContent} />
        ))}
        <Box sx={{ flexGrow: 1 }}></Box>
        {location.hash === "#workgroups" && (
          <AddButton label={"addWorkgroup"} variant={"contained"} onClick={addWorkgroup} />
        )}
      </BoreholeTabs>
      <BoreholeTabContentBox>{tabs[activeIndex].component}</BoreholeTabContentBox>
      <AddWorkgroupDialog open={workgroupDialogOpen} setOpen={setWorkgroupDialogOpen} />
    </>
  );
};
