import { FC, MouseEvent, ReactNode, useLayoutEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Box, Chip, IconButton, Stack, SxProps, Typography } from "@mui/material";
import { styled } from "@mui/system";
import { Copy, Plus, Trash2, TriangleAlert } from "lucide-react";
import { theme } from "../../../../AppTheme.ts";
import { StandaloneIconButton } from "../../../../components/buttons/buttons.tsx";
import { ResizeKind, ResizeSide } from "./useDescriptionResize.ts";

export const StratigraphyTableHeader = styled(Stack)(() => ({
  flexDirection: "row",
  justifyContent: "space-between",
  borderTopLeftRadius: theme.spacing(0.5),
  borderTopRightRadius: theme.spacing(0.5),
  backgroundColor: theme.palette.background.listItemActive,
  borderBottom: `2px solid ${theme.palette.border.darker}`,
  boxShadow: theme.shadows[3],
}));

interface HeaderCellProps {
  label: string;
  sx?: SxProps;
}

export const StratigraphyTableHeaderCell: FC<HeaderCellProps> = ({ label, sx }) => (
  <Stack sx={{ flex: "1", justifyContent: "center", paddingX: 2, paddingY: 1, ...sx }}>
    <Typography variant="body2" fontWeight="700">
      {label}
    </Typography>
  </Stack>
);

export const StratigraphyTableContent = styled(Stack)(() => ({
  flexDirection: "row",
  justifyContent: "space-between",
  "& > *": {
    borderLeft: `1px solid ${theme.palette.border.darker}`,
  },
  "& > *:last-child": {
    borderRight: `1px solid ${theme.palette.border.darker}`,
  },
}));

export const StratigraphyTableColumn = styled(Stack)(() => ({
  flex: "1",
}));

export const StratigraphyTableCell = styled(Stack)(() => ({
  justifyContent: "space-between",
  padding: theme.spacing(2),
  borderBottom: `1px solid ${theme.palette.border.darker}`,
}));

const StratigraphyTableCellRow = styled(Stack)(() => ({
  flexDirection: "row",
  justifyContent: "space-between",
  alignItems: "center",
  height: "36px",
}));

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
          minHeight: 0,
          overflow: "hidden",
          justifyContent: isOverflowing ? "flex-start" : "center",
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

interface StratigraphyTableGapProps {
  index: number;
  onClick?: (index: number) => void;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
  sx?: SxProps;
  dataCy?: string;
}

export const StratigraphyTableGap: FC<StratigraphyTableGapProps> = ({
  index,
  onClick,
  onMouseEnter,
  onMouseLeave,
  sx,
  dataCy,
}) => {
  const { t } = useTranslation();
  return (
    <StratigraphyTableCell
      sx={{
        padding: `${theme.spacing(1)} ${theme.spacing(2)}`,
        backgroundColor: theme.palette.error.background,

        ...(onClick && {
          "&:hover": {
            backgroundColor: theme.palette.error.backgroundHover,
            cursor: "pointer",
          },
        }),
        ...sx,
      }}
      data-cy={`${dataCy}-gap`}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      onClick={() => {
        if (onClick) {
          onClick(index);
        }
      }}>
      <StratigraphyTableCellRow color={theme.palette.error.main}>
        <Chip color="error" label={t("gap")} />
        <TriangleAlert />
      </StratigraphyTableCellRow>
      {onClick && (
        <Stack direction="row" justifyContent="center" alignItems="center">
          <LayerAddButton dataCy={`${dataCy}-add-button`} />
        </Stack>
      )}
      <StratigraphyTableCellRow />
    </StratigraphyTableCell>
  );
};

export const StratigraphyTableDescriptionGap: FC<StratigraphyTableGapProps> = ({
  index,
  onClick,
  onMouseEnter,
  onMouseLeave,
  sx,
  dataCy,
}) => (
  <StratigraphyTableCell
    sx={{
      padding: `${theme.spacing(1)} ${theme.spacing(2)}`,
      backgroundColor: theme.palette.background.lightgrey,

      ...(onClick && {
        "&:hover": {
          backgroundColor: theme.palette.background.grey,
          cursor: "pointer",
        },
      }),
      ...sx,
    }}
    data-cy={`${dataCy}-gap`}
    onMouseEnter={onMouseEnter}
    onMouseLeave={onMouseLeave}
    onClick={() => {
      if (onClick) {
        onClick(index);
      }
    }}>
    <StratigraphyTableCellRow />
    {onClick && (
      <Stack direction="row" justifyContent="center" alignItems="center">
        <LayerAddButton dataCy={`${dataCy}-add-button`} />
      </Stack>
    )}
    <StratigraphyTableCellRow />
  </StratigraphyTableCell>
);

interface LayerAddButtonProps {
  onClick?: (event: MouseEvent<HTMLButtonElement>) => void;
  dataCy?: string;
  size?: "small" | "default";
  sx?: SxProps;
}

export const LayerAddButton: FC<LayerAddButtonProps> = ({ onClick, dataCy, size = "default", sx }) => {
  const isSmall = size === "small";
  return (
    <IconButton
      onClick={onClick}
      data-cy={dataCy}
      sx={{
        padding: 0,
        borderRadius: "50%",
        backgroundColor: theme.palette.primary.main,
        color: theme.palette.primary.contrastText,
        width: isSmall ? 24 : 36,
        height: isSmall ? 24 : 36,
        "&:hover": {
          backgroundColor: theme.palette.buttonStates.contained.hoverOrFocus.backgroundColor,
        },
        ...sx,
      }}>
      <Plus />
    </IconButton>
  );
};

interface DescriptionResizeHandleProps {
  kind: ResizeKind;
  side: ResizeSide;
  fromDepth: number;
  toDepth: number;
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
