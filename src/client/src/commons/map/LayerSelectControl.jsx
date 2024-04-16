import { Button, Box } from "@mui/material";
import LayersOutlinedIcon from "@mui/icons-material/LayersOutlined";
import { theme } from "../../AppTheme";

const LayerSelectControl = ({ onShowLayerSelection, sidebarWidth }) => {
  return (
    <Box
      style={{
        position: "absolute",
        top: "6px",
        left: sidebarWidth > 0 ? sidebarWidth - 48 + "px" : "12px",
        zIndex: "1",
        backgroundColor: "#ffffff",
        boxShadow: "4px 4px 2px #00000029",
        borderRadius: "8px",
        alignItems: "center",
      }}>
      <Button sx={{ minWidth: 0, margin: 0 }} onClick={onShowLayerSelection}>
        <LayersOutlinedIcon sx={{ color: theme.palette.mapIcon.secondary }} />
      </Button>
    </Box>
  );
};

export default LayerSelectControl;
