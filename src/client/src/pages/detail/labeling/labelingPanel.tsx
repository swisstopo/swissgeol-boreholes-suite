import { Box, ToggleButton, ToggleButtonGroup } from "@mui/material";
import { PanelPosition, useLabelingContext } from "./labelingInterfaces.tsx";
import { PanelBottom, PanelRight } from "lucide-react";
import { MouseEvent } from "react";
import { theme } from "../../../AppTheme.ts";

const LabelingPanel = () => {
  const { panelPosition, setPanelPosition } = useLabelingContext();

  return (
    <Box
      sx={{
        backgroundColor: theme.palette.ai.background,
        height: panelPosition === "bottom" ? "50%" : "100%",
        width: panelPosition === "right" ? "50%" : "100%",
      }}
      data-cy="labeling-panel">
      <ToggleButtonGroup
        value={panelPosition}
        onChange={(event: MouseEvent<HTMLElement>, nextPosition: PanelPosition) => {
          setPanelPosition(nextPosition);
        }}
        exclusive
        sx={{
          position: "absolute",
          bottom: "10px",
          right: "10px",
          zIndex: "500",
        }}>
        <ToggleButton value="bottom" data-cy="labeling-panel-position-bottom">
          <PanelBottom />
        </ToggleButton>
        <ToggleButton value="right" data-cy="labeling-panel-position-right">
          <PanelRight />
        </ToggleButton>
      </ToggleButtonGroup>
    </Box>
  );
};

export default LabelingPanel;
