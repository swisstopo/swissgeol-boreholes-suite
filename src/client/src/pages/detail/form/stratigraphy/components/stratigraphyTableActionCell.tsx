import { FC, ReactNode, useLayoutEffect, useRef, useState } from "react";
import { Stack, SxProps } from "@mui/material";
import { Copy, Trash2 } from "lucide-react";
import { theme } from "../../../../../AppTheme.ts";
import { StandaloneIconButton } from "../../../../../components/buttons/buttons.tsx";
import { StratigraphyTableCell } from "./stratigraphyTablePrimitives.tsx";

interface StratigraphyTableLayerCellProps {
  children: ReactNode;
  index: number;
  onHoverClick?: (index: number) => void;
  onClick?: (index: number) => void;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
  sx?: SxProps;
  isAutoCorrected?: boolean;
  dataCy?: string;
  resizeHandles?: ReactNode;
}

// TODO: Fix AutoCorrected-Style. Either remove it or add the colors to the theme: https://github.com/swisstopo/swissgeol-boreholes-suite/issues/2843
export const StratigraphyTableActionCell: FC<StratigraphyTableLayerCellProps> = ({
  children,
  index,
  onHoverClick,
  onClick,
  onMouseEnter,
  onMouseLeave,
  sx,
  isAutoCorrected,
  dataCy,
  resizeHandles,
}) => {
  const stackRef = useRef<HTMLDivElement>(null);
  const [isOverflowing, setIsOverflowing] = useState(false);
  const isEditing = Boolean(onClick);

  useLayoutEffect(() => {
    const el = stackRef.current;
    if (el) {
      setIsOverflowing(el.scrollHeight > el.clientHeight);
    }
  }, [children]);

  return (
    <StratigraphyTableCell
      data-cy={dataCy}
      sx={{
        position: "relative",
        justifyContent: "center",
        backgroundColor: isAutoCorrected ? "#FFD6C0" : undefined,
        "& .hover-content": { visibility: "hidden" },
        "&:hover": {
          backgroundColor: isAutoCorrected ? "#FFBD99" : theme.palette.background.grey,
          cursor: "pointer",
          "& .hover-content": { visibility: "visible" },
        },
        ...sx,
      }}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      onClick={() => {
        if (onClick && isEditing) {
          onClick(index);
        }
      }}>
      <Stack
        ref={stackRef}
        gap={1}
        sx={{
          flex: "1 1 auto",
          minWidth: 0,
          minHeight: 0,
          overflow: "hidden",
          justifyContent: isOverflowing ? "flex-start" : "center",
          overflowWrap: "anywhere",
          wordBreak: "break-word",
        }}>
        {children}
      </Stack>
      {resizeHandles}
      {onHoverClick && (
        <Stack
          className="hover-content"
          sx={{
            position: "absolute",
            top: 0,
            right: 0,
            padding: theme.spacing(1),
            backgroundColor: theme.palette.background.grey,
            borderBottomLeftRadius: theme.spacing(0.5),
            zIndex: 1,
          }}>
          <StandaloneIconButton
            icon={isEditing ? <Trash2 /> : <Copy />}
            dataCy={isEditing ? "deleteLayer-button" : "copyLayer-button"}
            onClick={e => {
              e.stopPropagation();
              onHoverClick(index);
            }}
            color={"primaryInverse"}
            sx={{
              backgroundColor: theme.palette.background.grey,
            }}
          />
        </Stack>
      )}
    </StratigraphyTableCell>
  );
};
