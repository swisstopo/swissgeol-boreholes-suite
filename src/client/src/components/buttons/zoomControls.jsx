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
      <Button data-cy="zoom-in-button" variant="text" color="secondary" onClick={onZoomIn}>
        <Plus />
      </Button>
      <Button data-cy="fit-to-extent-button" variant="text" color="secondary" onClick={onFitToExtent}>
        <Circle />
      </Button>
      <Button data-cy="zoom-out-button" variant="text" color="secondary" onClick={onZoomOut}>
        <Minus />
      </Button>
    </ButtonGroup>
  );
};

export default ZoomControls;
