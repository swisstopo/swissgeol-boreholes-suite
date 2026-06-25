import { FC, ReactNode } from "react";
import { theme } from "../../../../../AppTheme.ts";
import { DepthLayer } from "../stratigraphy.ts";
import { defaultRowHeight } from "./stratigraphyTableConstants.ts";
import { StratigraphyTableCell } from "./stratigraphyTablePrimitives.tsx";

interface DepthColumnCellProps {
  depth: DepthLayer;
  showHoverContent: boolean;
  isDeletePreview: boolean;
  children: ReactNode;
}

export const DepthColumnCell: FC<DepthColumnCellProps> = ({ depth, showHoverContent, isDeletePreview, children }) => (
  <StratigraphyTableCell
    data-cy={`depth-${depth.fromDepth}-${depth.toDepth}`}
    data-show-hover-content={showHoverContent}
    data-delete-preview={isDeletePreview}
    sx={{
      height: `${defaultRowHeight}px`,
      position: "relative",
      overflow: "visible",
      ...(isDeletePreview && {
        backgroundColor: theme.palette.error.background,
      }),
      "& .hover-content": {
        visibility: showHoverContent ? "visible" : "hidden",
      },
      "&:hover .hover-content": { visibility: "visible" },
    }}>
    {children}
  </StratigraphyTableCell>
);
