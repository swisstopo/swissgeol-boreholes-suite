import { FC, ReactNode, useLayoutEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Box, Chip, IconButton, Stack, SxProps, Typography } from "@mui/material";
import { styled } from "@mui/system";
import { Copy, Plus, Trash2, TriangleAlert } from "lucide-react";
import { BaseLayer } from "../../../../../api/stratigraphy.ts";
import { theme } from "../../../../../AppTheme.ts";

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

interface StratigraphyTableCellRowProps {
  height?: string;
}

export const StratigraphyTableCellRow = styled(Stack)<StratigraphyTableCellRowProps>(({ height = "36px" }) => ({
  flexDirection: "row",
  justifyContent: "space-between",
  alignItems: "center",
  height: height,
}));

interface StratigraphyTableLayerCellProps {
  children: ReactNode;
  layer: BaseLayer;
  onHoverClick?: (layer: BaseLayer) => void;
  onClick?: (layer: BaseLayer) => void;
  sx?: SxProps;
  scaleY?: number;
}

export const StratigraphyTableActionCell: FC<StratigraphyTableLayerCellProps> = ({
  children,
  layer,
  onHoverClick,
  onClick,
  sx,
  scaleY = 1,
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
      sx={{
        justifyContent: "center",

        "& .hover-content": { display: "none" },

        "&:hover": {
          justifyContent: "space-between",
          backgroundColor: theme.palette.background.grey,
          cursor: onHoverClick ? "pointer" : "inherit",

          "& .hover-content": { display: "inherit" },
        },
        py: 2 / scaleY,
        ...sx,
      }}
      onClick={() => {
        if (onClick && isEditing) {
          onClick(layer);
        }
      }}>
      {onHoverClick && (
        <StratigraphyTableCellRow
          className="hover-content"
          height={`${36 / scaleY}px`}
          sx={{
            justifyContent: layer?.fromDepth !== null && layer?.fromDepth !== undefined ? "space-between" : "flex-end",
          }}>
          {layer?.fromDepth !== null && layer?.fromDepth !== undefined && (
            <Typography sx={{ transform: `scaleY(${1 / scaleY})` }} variant="body1">
              {layer?.fromDepth} m MD
            </Typography>
          )}
          <IconButton
            color={"primaryInverse"}
            sx={{
              borderRadius: theme.spacing(0.5),
              width: "36px",
              height: "36px",
              transform: `scaleY(${1 / scaleY})`,
            }}
            onClick={e => {
              e.stopPropagation();
              onHoverClick(layer);
            }}>
            {isEditing ? <Trash2 /> : <Copy />}
          </IconButton>
        </StratigraphyTableCellRow>
      )}
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
        <StratigraphyTableCellRow className="hover-content" height={`${36 / scaleY}px`}>
          {layer?.toDepth !== null && layer?.toDepth !== undefined && (
            <Typography sx={{ transform: `scaleY(${1 / scaleY})` }} variant="body1">
              {layer?.toDepth} m MD
            </Typography>
          )}
        </StratigraphyTableCellRow>
      )}
    </StratigraphyTableCell>
  );
};

interface StratigraphyTableGapProps {
  layer: BaseLayer;
  onClick?: (layer: BaseLayer) => void;
  sx?: SxProps;
  scaleY?: number;
}

export const StratigraphyTableGap: FC<StratigraphyTableGapProps> = ({ layer, onClick, sx, scaleY = 1 }) => {
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
      onClick={() => {
        if (onClick) {
          onClick(layer);
        }
      }}>
      <StratigraphyTableCellRow color={theme.palette.error.main} mt={3 / scaleY}>
        <Chip color="error" label={t("gap")} sx={{ transform: `scaleY(${1 / scaleY})` }} />
        <Box sx={{ transform: `scaleY(${1 / scaleY})` }}>
          <TriangleAlert />
        </Box>
      </StratigraphyTableCellRow>
      {onClick && (
        <Stack direction="row" justifyContent="center" alignItems="center">
          <LayerAddButton />
        </Stack>
      )}
      <StratigraphyTableCellRow />
    </StratigraphyTableCell>
  );
};

export const LayerAddButton = () => (
  <IconButton
    sx={{
      borderRadius: "50%",
      backgroundColor: theme.palette.primary.main,
      color: theme.palette.primary.contrastText,
      width: 36,
      height: 36,
      "&:hover": {
        backgroundColor: theme.palette.buttonStates.contained.hoverOrFocus.backgroundColor,
      },
    }}>
    <Plus />
  </IconButton>
);

export const AddRowButton = () => {
  const dashedOutlineImage = `url("data:image/svg+xml,%3Csvg width='100%25' height='100%25' xmlns='http://www.w3.org/2000/svg'%3E%3Crect width='100%25' height='100%25' fill='none' rx='8' ry='8' stroke='%23C6D3DA' stroke-width='1' stroke-dasharray='9%2C9' stroke-dashoffset='0' stroke-linecap='square'/%3E%3C/svg%3E")`;
  const dashedOutlineImageHover = `url("data:image/svg+xml,%3Csvg width='100%25' height='100%25' xmlns='http://www.w3.org/2000/svg'%3E%3Crect width='100%25' height='100%25' fill='none' rx='8' ry='8' stroke='%23ACB4BD' stroke-width='1' stroke-dasharray='9%2C9' stroke-dashoffset='0' stroke-linecap='square'/%3E%3C/svg%3E")`;

  return (
    <Stack
      sx={{
        justifyContent: "center",
        alignItems: "center",
        height: "100%",
        width: "100%",
        padding: 1.5,
        borderRadius: "8px",
        backgroundImage: dashedOutlineImage,
        "&:hover": {
          backgroundImage: dashedOutlineImageHover,
          cursor: "pointer",
          "& .MuiIconButton-root": {
            backgroundColor: theme.palette.buttonStates.contained.hoverOrFocus.backgroundColor,
          },
        },
      }}>
      <LayerAddButton />
    </Stack>
  );
};
