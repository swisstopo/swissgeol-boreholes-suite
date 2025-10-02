import { FC, ReactNode, useLayoutEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Chip, IconButton, Stack, SxProps, Typography } from "@mui/material";
import { styled } from "@mui/system";
import { Copy, Plus, Trash2, TriangleAlert } from "lucide-react";
import { BaseLayer } from "../../../../api/stratigraphy.ts";
import { theme } from "../../../../AppTheme.ts";

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

export const StratigraphyTableCellRow = styled(Stack)(() => ({
  flexDirection: "row",
  justifyContent: "space-between",
  alignItems: "center",
  height: "36px",
}));

interface StratigraphyTableLayerCellProps {
  children: ReactNode;
  layer: BaseLayer;
  onHoverClick?: (layer: BaseLayer) => void;
  onClick?: (layer: BaseLayer) => void;
  sx?: SxProps;
}

export const StratigraphyTableActionCell: FC<StratigraphyTableLayerCellProps> = ({
  children,
  layer,
  onHoverClick,
  onClick,
  sx,
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

        "& .hover-content": { visibility: "hidden" },

        "&:hover": {
          justifyContent: "space-between",
          backgroundColor: theme.palette.background.grey,
          cursor: "pointer",

          "& .hover-content": { visibility: "visible" },
        },
        ...sx,
      }}
      onClick={() => {
        if (onClick && isEditing) {
          onClick(layer);
        }
      }}>
      <StratigraphyTableCellRow
        className="hover-content"
        sx={{
          justifyContent: layer?.fromDepth !== null && layer?.fromDepth !== undefined ? "space-between" : "flex-end",
        }}>
        {layer?.fromDepth !== null && layer?.fromDepth !== undefined && (
          <Typography variant="body1">{layer?.fromDepth} m MD</Typography>
        )}
        {onHoverClick && (
          <IconButton
            color={"primaryInverse"}
            sx={{
              borderRadius: theme.spacing(0.5),
              width: "36px",
              height: "36px",
            }}
            onClick={e => {
              e.stopPropagation();
              onHoverClick(layer);
            }}>
            {isEditing ? <Trash2 /> : <Copy />}
          </IconButton>
        )}
      </StratigraphyTableCellRow>
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
      <StratigraphyTableCellRow className="hover-content">
        {layer?.toDepth !== null && layer?.toDepth !== undefined && (
          <Typography variant="body1">{layer?.toDepth} m MD</Typography>
        )}
      </StratigraphyTableCellRow>
    </StratigraphyTableCell>
  );
};

interface StratigraphyTableGapProps {
  layer: BaseLayer;
  onClick?: (layer: BaseLayer) => void;
  sx?: SxProps;
}

export const StratigraphyTableGap: FC<StratigraphyTableGapProps> = ({ layer, onClick, sx }) => {
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
      <StratigraphyTableCellRow color={theme.palette.error.main}>
        <Chip color="error" label={t("gap")} />
        <TriangleAlert />
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

interface AddButtonProps {
  onClick?: () => void;
}

export const LayerAddButton: FC<AddButtonProps> = ({ onClick }) => (
  <IconButton
    onClick={onClick}
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

export const AddRowButton: FC<AddButtonProps> = ({ onClick }) => {
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
      <LayerAddButton onClick={onClick} />
    </Stack>
  );
};
