import { FC, MouseEvent, ReactNode, useLayoutEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Chip, IconButton, Stack, SxProps, Typography } from "@mui/material";
import { styled } from "@mui/system";
import { Copy, Plus, Trash2, TriangleAlert } from "lucide-react";
import { theme } from "../../../../AppTheme.ts";
import { StandaloneIconButton } from "../../../../components/buttons/buttons.tsx";
import { defaultRowHeight, DepthLayer } from "./lithologyTableUtils.ts";
import { DepthInsertPosition } from "./useLithologyTableState.ts";

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

  // TODO: Fix AutoCorrected-Style. Either remove it or add the colors to the theme
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

interface InsertDepthButtonProps {
  depth: DepthLayer;
  onClick: (adjacentDepthId: string, position: DepthInsertPosition) => void;
  position: DepthInsertPosition;
}

export const InsertDepthButton: FC<InsertDepthButtonProps> = ({ depth, onClick, position }) => {
  return (
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
};

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

interface DepthDeleteButtonProps {
  isMenuOpen: boolean;
  onClick: (event: MouseEvent<HTMLElement>) => void;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
  dataCy: string;
}

export const DepthDeleteButton: FC<DepthDeleteButtonProps> = ({
  isMenuOpen,
  onClick,
  onMouseEnter,
  onMouseLeave,
  dataCy,
}) => {
  const activeBackground = theme.palette.buttonStates.outlined.active.backgroundColor;
  const neutralBackground = theme.palette.background.grey;
  const background = isMenuOpen ? activeBackground : neutralBackground;
  return (
    <Stack
      className="hover-content"
      sx={{
        position: "absolute",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        zIndex: 2,
      }}>
      <StandaloneIconButton
        icon={<Trash2 />}
        color={isMenuOpen ? undefined : "primaryInverse"}
        onClick={onClick}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
        dataCy={dataCy}
        sx={{
          backgroundColor: background,
          ...(isMenuOpen && { color: theme.palette.buttonStates.outlined.active.color }),
          "&:hover": { backgroundColor: background },
        }}
      />
    </Stack>
  );
};
