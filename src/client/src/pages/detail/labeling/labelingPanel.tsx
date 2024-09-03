import { Box } from "@mui/material";
import { useLabelingContext } from "./labelingInterfaces.tsx";

const LabelingPanel = () => {
  const { panelPosition } = useLabelingContext();
  return (
    <Box
      sx={{
        backgroundColor: "#f0f0f0",
        height: panelPosition === "bottom" ? "50%" : "100%",
        width: panelPosition === "right" ? "50%" : "100%",
      }}
    />
  );
};

export default LabelingPanel;
