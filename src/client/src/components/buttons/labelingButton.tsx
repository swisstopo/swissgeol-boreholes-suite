import { forwardRef } from "react";
import { useTranslation } from "react-i18next";
import { ButtonProps, IconButton, Tooltip } from "@mui/material";
import { Sparkles } from "lucide-react";
import SidebarDown from "../../assets/icons/sidebarDown.svg?react";
import SidebarLeft from "../../assets/icons/sidebarLeft.svg?react";
import SidebarRight from "../../assets/icons/sidebarRight.svg?react";
import SidebarUp from "../../assets/icons/sidebarUp.svg?react";

export const LabelingButton = forwardRef<HTMLButtonElement, ButtonProps>((props, ref) => {
  const { t } = useTranslation();
  return (
    <Tooltip title={t("dataExtraction")}>
      <IconButton
        ref={ref}
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
});

interface LabelingToggleButtonProps extends ButtonProps {
  panelOpen: boolean;
  panelPosition: "right" | "bottom";
}

export const LabelingToggleButton = forwardRef<HTMLButtonElement, LabelingToggleButtonProps>((props, ref) => {
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
    <Tooltip title={t("dataExtraction")}>
      <IconButton
        ref={ref}
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
});
