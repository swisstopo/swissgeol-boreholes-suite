import { ButtonProps, IconButton, Tooltip } from "@mui/material";
import { forwardRef } from "react";
import { ChevronDown, ChevronRight, Sparkles } from "lucide-react";
import { useTranslation } from "react-i18next";

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
        }}>
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

  return (
    <Tooltip title={t("dataExtraction")}>
      <IconButton
        ref={ref}
        {...defaultProps}
        color="ai"
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
        {panelOpen ? panelPosition === "right" ? <ChevronRight /> : <ChevronDown /> : <Sparkles />}
      </IconButton>
    </Tooltip>
  );
});
