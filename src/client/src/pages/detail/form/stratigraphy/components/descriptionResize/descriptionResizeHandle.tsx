import { FC, MouseEvent } from "react";
import { Box } from "@mui/material";
import { theme } from "../../../../../../AppTheme.ts";
import { DescriptionKind } from "../../stratigraphy.ts";
import { ResizeSide } from "./useDescriptionResize.ts";

interface DescriptionResizeHandleProps {
  kind: DescriptionKind;
  side: ResizeSide;
  fromDepth: number | null;
  toDepth: number | null;
  onMouseDown: (event: MouseEvent<HTMLElement>) => void;
}

export const DescriptionResizeHandle: FC<DescriptionResizeHandleProps> = ({
  kind,
  side,
  fromDepth,
  toDepth,
  onMouseDown,
}) => (
  <Box
    className="hover-content"
    data-cy={`resize-description-${kind}-${side}-${fromDepth}-${toDepth}`}
    onMouseDown={onMouseDown}
    sx={{
      position: "absolute",
      [side]: theme.spacing(0.75),
      left: theme.spacing(0.75),
      right: theme.spacing(0.75),
      height: "3px",
      cursor: "ns-resize",
      display: "flex",
      justifyContent: "center",
      zIndex: 2,
      // Extend the interactive hit-box vertically beyond the visible pill.
      "&::before": {
        content: '""',
        position: "absolute",
        top: "-9px",
        bottom: "-9px",
        left: 0,
        right: 0,
      },
      "& > .resize-handle-pill": {
        height: "3px",
        width: "40px",
        borderRadius: "8px",
        backgroundColor: theme.palette.primary.muted,
        transition: "width 150ms ease-out, background-color 150ms ease-out",
      },
      "&:hover > .resize-handle-pill": {
        width: "100%",
        backgroundColor: theme.palette.primary.main,
      },
    }}>
    <Box className="resize-handle-pill" />
  </Box>
);
