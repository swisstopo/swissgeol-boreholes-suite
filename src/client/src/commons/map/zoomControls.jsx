import { Button, Box } from "@mui/material";
import Add from "@mui/icons-material/Add";
import Remove from "@mui/icons-material/Remove";
import TripOriginIcon from "@mui/icons-material/TripOrigin";
import styled from "@mui/material/styles/styled";
import { theme } from "../../AppTheme";

const ZoomControls = ({ onZoomIn, onZoomOut, onFitToExtent }) => {
  const NoMarginButton = styled(Button)({
    minWidth: 0,
    margin: 0,
  });

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        top: "6px",
        right: "12px",
        position: "absolute",
        backgroundColor: theme.palette.background.default,
        boxShadow: "4px 4px 2px " + theme.palette.boxShadow,
        borderRadius: "8px",
        alignItems: "center",
      }}>
      <NoMarginButton data-cy="map-zoom-in" onClick={onZoomIn}>
        <Add sx={{ color: theme.palette.mapIcon.main }} />
      </NoMarginButton>
      <NoMarginButton onClick={onFitToExtent} sx={{ padding: "12px" }}>
        <TripOriginIcon sx={{ color: theme.palette.mapIcon.main, fontSize: "13px" }} />
      </NoMarginButton>
      <NoMarginButton onClick={onZoomOut}>
        <Remove sx={{ color: theme.palette.mapIcon.main }} />
      </NoMarginButton>
    </Box>
  );
};

export default ZoomControls;
