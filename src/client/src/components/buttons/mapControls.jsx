import { Button, ButtonGroup, Stack } from "@mui/material";
import { Minus, Plus, RotateCwSquare } from "lucide-react";
import Circle from "../../assets/icons/circle.svg?react";

import { theme } from "../../AppTheme";

const MapControls = ({ onZoomIn, onZoomOut, onFitToExtent, onRotate }) => {
  return (
    <Stack
      sx={{
        position: "absolute",
        top: theme.spacing(2),
        right: theme.spacing(2),
        zIndex: "500",
        gap: 1,
      }}>
      <ButtonGroup variant="contained" orientation="vertical">
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
      {!!onRotate && (
        <Button
          variant="text"
          onClick={onRotate}
          sx={{
            height: "44px",
            boxShadow:
              "0px 3px 1px -2px rgba(0, 0, 0, 0.2), 0px 2px 2px 0px rgba(0, 0, 0, 0.14), 0px 1px 5px 0px rgba(0, 0, 0, 0.12)",
          }}>
          <RotateCwSquare />
        </Button>
      )}
    </Stack>
  );
};

export default MapControls;
