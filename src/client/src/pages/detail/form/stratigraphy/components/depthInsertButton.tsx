import { FC } from "react";
import { Stack } from "@mui/material";
import { DepthLayer } from "../../../../../api/stratigraphy.ts";
import { LayerAddButton } from "./layerAddButton.tsx";
import { DepthInsertPosition } from "./lithologyTable/useLithologyTableState.ts";

interface DepthInsertButtonProps {
  depth: DepthLayer;
  onClick: (adjacentDepthId: string, position: DepthInsertPosition) => void;
  position: DepthInsertPosition;
}

export const DepthInsertButton: FC<DepthInsertButtonProps> = ({ depth, onClick, position }) => (
  <Stack
    className="hover-content"
    sx={{
      position: "absolute",
      left: "-12px",
      top: position === "before" ? "-12px" : undefined,
      bottom: position === "after" ? "-12px" : undefined,
      zIndex: 3,
    }}>
    <LayerAddButton
      size="small"
      dataCy={`insert-depth-${position}-${depth.fromDepth}-${depth.toDepth}-button`}
      onClick={event => {
        event.stopPropagation();
        onClick(depth.id, position);
      }}
    />
  </Stack>
);
