import { ReactNode, SyntheticEvent, useEffect, useState } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
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
  const navigate = useNavigate();
  const { pathname, hash } = useLocation();
  const [searchParams] = useSearchParams();
  const [activeIndex, setActiveIndex] = useState(0);
  const [workgroupDialogOpen, setWorkgroupDialogOpen] = useState(false);

  // Initialize and update activeIndex based on the current URL hash
  useEffect(() => {
    const newActiveIndex = tabs.findIndex(tab => tab.hash === hash);
    if (newActiveIndex > -1) {
      setActiveIndex(newActiveIndex);
    } else {
      // Redirect to the first tab if hash is not valid
      navigate({
        pathname: pathname,
        search: searchParams.toString(),
        hash: tabs[0].hash,
      });
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
      <BoreholeTabs value={activeIndex} onChange={handleIndexChange}>
        {tabs.map(tab => (
          <BoreholeTab
            data-cy={`${tab.hash.replace("#", "")}-tab`}
            label={tab.label}
            key={tab.hash}
            hasContent={tab.hasContent}
          />
        ))}
        <Box sx={{ flexGrow: 1 }}></Box>
        {hash === "#workgroups" && <AddButton label={"addWorkgroup"} variant={"contained"} onClick={addWorkgroup} />}
      </BoreholeTabs>
      <BoreholeTabContentBox flex="1 0 0">{tabs[activeIndex].component}</BoreholeTabContentBox>
      <AddWorkgroupDialog open={workgroupDialogOpen} setOpen={setWorkgroupDialogOpen} />
    </>
  );
};
