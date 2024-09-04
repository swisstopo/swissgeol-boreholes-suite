import { Box, ToggleButton, ToggleButtonGroup } from "@mui/material";
import { useLabelingContext } from "./labelingInterfaces.tsx";
import { PanelBottom, PanelRight } from "lucide-react";
import { MouseEvent } from "react";

const LabelingPanel = () => {
  const { panelPosition, setPanelPosition } = useLabelingContext();

  return (
    <Box
      sx={{
        backgroundColor: "#46596B",
        height: panelPosition === "bottom" ? "50%" : "100%",
        width: panelPosition === "right" ? "50%" : "100%",
      }}>
      <ToggleButtonGroup
        value={panelPosition}
        onChange={(event: MouseEvent<HTMLElement>, nextPosition: "right" | "bottom") => {
          setPanelPosition(nextPosition);
        }}
        exclusive
        sx={{
          position: "absolute",
          bottom: "10px",
          right: "10px",
          zIndex: "500",
        }}>
        <ToggleButton value="bottom">
          <PanelBottom />
        </ToggleButton>
        <ToggleButton value="right">
          <PanelRight />
        </ToggleButton>
      </ToggleButtonGroup>
    </Box>
  );
};

export default LabelingPanel;
