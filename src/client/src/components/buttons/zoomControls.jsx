import { Button, ButtonGroup } from "@mui/material";
import { Minus, Plus } from "lucide-react";
import Circle from "../../assets/icons/circle.svg?react";

const ZoomControls = ({ onZoomIn, onZoomOut, onFitToExtent }) => {
  return (
    <ButtonGroup
      variant="contained"
      orientation="vertical"
      sx={{
        position: "absolute",
        top: "16px",
        right: "16px",
        zIndex: "500",
      }}>
      <Button variant="text" color="secondary" onClick={onZoomIn}>
        <Plus />
      </Button>
      <Button variant="text" color="secondary" onClick={onFitToExtent}>
        <Circle />
      </Button>
      <Button variant="text" color="secondary" onClick={onZoomOut}>
        <Minus />
      </Button>
    </ButtonGroup>
  );
};

export default ZoomControls;
