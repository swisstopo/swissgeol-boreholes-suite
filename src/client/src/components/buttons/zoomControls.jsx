import { Button, ButtonGroup } from "@mui/material";
import { Minus, Plus } from "lucide-react";
import Circle from "../../assets/icons/circle.svg?react";
import { theme } from "../../AppTheme";

const ZoomControls = ({ onZoomIn, onZoomOut, onFitToExtent, applyBaseStyling = true }) => {
  const baseSx = {
    position: "absolute",
    top: theme.spacing(2),
    right: theme.spacing(2),
    zIndex: "500",
  };

  return (
    <ButtonGroup variant="contained" orientation="vertical" sx={applyBaseStyling ? { ...baseSx } : {}}>
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
