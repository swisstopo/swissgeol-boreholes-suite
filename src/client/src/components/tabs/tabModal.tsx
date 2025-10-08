import { FC } from "react";
import { Dialog, ToggleButton, ToggleButtonGroup, Typography } from "@mui/material";
import { theme } from "../../AppTheme";
import { BoreholesButton } from "../buttons/buttons";
import { DialogFooterContainer, DialogHeaderContainer, DialogMainContent } from "../styledComponents";
import { Tab } from "./tabPanel";

interface TabModalProps {
  open: boolean;
  onClose: (open: boolean) => void;
  title: string;
  tabs: Tab[];
  activeIndex: number;
  setActiveIndex: (index: number) => void;
}

export const TabModal: FC<TabModalProps> = ({ open, onClose, title, tabs, activeIndex, setActiveIndex }) => {
  return (
    <Dialog open={open} fullScreen>
      <DialogHeaderContainer sx={{ justifyContent: "space-between" }}>
        <Typography variant="h4" sx={{ flexGrow: 1 }}>
          {title}
        </Typography>
        {tabs.length > 1 && (
          <ToggleButtonGroup
            value={activeIndex}
            onChange={(_, value) => setActiveIndex(value)}
            exclusive
            sx={{
              boxShadow: "none",
              border: `1px solid ${theme.palette.border.light}`,
            }}>
            {tabs.map((tab, index) => (
              <ToggleButton key={tab.hash} value={index}>
                <Typography>{tab.label}</Typography>
              </ToggleButton>
            ))}
          </ToggleButtonGroup>
        )}
      </DialogHeaderContainer>
      <DialogMainContent>{tabs[activeIndex].component}</DialogMainContent>
      <DialogFooterContainer>
        <BoreholesButton variant="contained" color="primary" label={"close"} onClick={() => onClose(false)} />
      </DialogFooterContainer>
    </Dialog>
  );
};
