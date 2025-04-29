import { FC, Ref } from "react";
import { useTranslation } from "react-i18next";
import { Box, Button, ButtonProps, IconButton, Tooltip } from "@mui/material";
import { Sparkles } from "lucide-react";
import SelectTextIcon from "../../assets/icons/selectText.svg?react";
import SidebarDown from "../../assets/icons/sidebarDown.svg?react";
import SidebarLeft from "../../assets/icons/sidebarLeft.svg?react";
import SidebarRight from "../../assets/icons/sidebarRight.svg?react";
import SidebarUp from "../../assets/icons/sidebarUp.svg?react";
import { theme } from "../../AppTheme.ts";

interface ExtractionButtonProps extends ButtonProps {
  ref?: Ref<HTMLButtonElement>;
}

export const CoordinateExtractionButton: FC<ExtractionButtonProps> = props => {
  const { t } = useTranslation();
  return (
    <Tooltip title={t("extractCoordinates")}>
      <IconButton
        {...props}
        color="ai"
        sx={{
          borderRadius: "4px",
        }}
        data-cy="labeling-button">
        <Sparkles />
      </IconButton>
    </Tooltip>
  );
};

interface SidePanelToggleButtonProps extends ButtonProps {
  panelOpen: boolean;
  panelPosition: "right" | "bottom";
  ref?: Ref<HTMLButtonElement>;
}

export const SidePanelToggleButton: FC<SidePanelToggleButtonProps> = props => {
  const { panelOpen, panelPosition, ...defaultProps } = props;
  const { t } = useTranslation();

  const iconMap = {
    right: {
      open: <SidebarRight />,
      closed: <SidebarLeft />,
    },
    bottom: {
      open: <SidebarDown />,
      closed: <SidebarUp />,
    },
  };

  const getIcon = () => {
    return iconMap[panelPosition][panelOpen ? "open" : "closed"];
  };

  return (
    <Tooltip title={t("openSidepanel")}>
      <IconButton
        {...defaultProps}
        color={"primary"}
        sx={{
          position: "absolute",
          zIndex: 1000,
          width: "44px",
          height: "44px",
          borderRadius: panelPosition === "right" ? "4px 0 0 4px" : "4px 0 0 0",
          right: 0,
          bottom: panelPosition === "bottom" ? "0" : undefined,
        }}
        data-cy="labeling-toggle-button">
        {getIcon()}
      </IconButton>
    </Tooltip>
  );
};

export const TextExtractionButton = ({ onClick, disabled }: { onClick: () => void; disabled: boolean }) => {
  const { t } = useTranslation();
  return (
    <Tooltip title={t("extractText")}>
      <Button
        data-cy="text-extraction-button"
        disabled={disabled}
        variant="text"
        onClick={onClick}
        sx={{
          p: 0.5,
          boxShadow: 1,
          height: "44px",
        }}>
        <Box
          sx={{
            p: 1,
            lineHeight: 1,
            borderRadius: 1,
            backgroundColor: disabled ? theme.palette.action.disabled : theme.palette.primary.main,
            color: theme.palette.primary.contrastText,
          }}>
          <SelectTextIcon />
        </Box>
      </Button>
    </Tooltip>
  );
};
