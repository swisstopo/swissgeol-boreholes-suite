import { FC, MouseEvent, useState } from "react";
import { useTranslation } from "react-i18next";
import { Stack } from "@mui/material";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import { Trash2 } from "lucide-react";
import { DepthLayer } from "../../../../../api/stratigraphy.ts";
import { theme } from "../../../../../AppTheme.ts";
import { StandaloneIconButton } from "../../../../../components/buttons/buttons.tsx";
import { DepthDeleteAction } from "./lithologyTable/useLithologyTableState.ts";

interface DepthDeleteButtonProps {
  depth: DepthLayer;
  isFirst: boolean;
  isLast: boolean;
  isOnly: boolean;
  onDelete: (depthId: string, action: DepthDeleteAction) => void;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
  onMenuOpenChange?: (isOpen: boolean) => void;
}

export const DepthDeleteButton: FC<DepthDeleteButtonProps> = ({
  depth,
  isFirst,
  isLast,
  isOnly,
  onDelete,
  onMouseEnter,
  onMouseLeave,
  onMenuOpenChange,
}) => {
  const { t } = useTranslation();
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const isMenuOpen = anchorEl !== null;

  const activeBackground = theme.palette.buttonStates.outlined.active.backgroundColor;
  const neutralBackground = theme.palette.background.grey;
  const background = isMenuOpen ? activeBackground : neutralBackground;

  const handleClick = (event: MouseEvent<HTMLElement>) => {
    event.stopPropagation();
    if (isOnly) {
      onDelete(depth.id, "extendLower");
      return;
    }
    setAnchorEl(event.currentTarget);
    onMenuOpenChange?.(true);
  };

  const closeMenu = () => {
    setAnchorEl(null);
    onMenuOpenChange?.(false);
  };

  const handleAction = (action: DepthDeleteAction) => {
    onDelete(depth.id, action);
    closeMenu();
  };

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
        onClick={handleClick}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
        dataCy={`delete-depth-${depth.fromDepth}-${depth.toDepth}-button`}
        sx={{
          backgroundColor: background,
          ...(isMenuOpen && { color: theme.palette.buttonStates.outlined.active.color }),
          "&:hover": { backgroundColor: background },
        }}
      />
      <Menu
        anchorEl={anchorEl}
        open={isMenuOpen}
        onClose={closeMenu}
        anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
        transformOrigin={{ vertical: "top", horizontal: "left" }}
        slotProps={{
          paper: {
            sx: {
              marginTop: theme.spacing(0.5),
              border: `1px solid ${theme.palette.border.darker}`,
              boxShadow: theme.shadows[1],
            },
          },
        }}>
        <MenuItem
          onClick={() => handleAction(isFirst ? "raiseBoreholeStart" : "extendUpper")}
          data-cy={isFirst ? "raise-borehole-start-depth" : "extend-upper-layer-downward"}>
          {isFirst ? t("raiseBoreholeStartDepth") : t("extendUpperLayerDownward")}
        </MenuItem>
        <MenuItem
          onClick={() => handleAction(isLast ? "reduceBoreholeEnd" : "extendLower")}
          data-cy={isLast ? "reduce-borehole-end-depth" : "extend-lower-layer-upward"}>
          {isLast ? t("reduceBoreholeEndDepth") : t("extendLowerLayerUpward")}
        </MenuItem>
      </Menu>
    </Stack>
  );
};
