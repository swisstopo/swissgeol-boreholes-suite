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
          data-cy="rotate-button"
          variant="text"
          onClick={onRotate}
          sx={{
            height: "44px",
            boxShadow: 1,
          }}>
          <RotateCwSquare />
        </Button>
      )}
    </Stack>
  );
};

export default MapControls;
