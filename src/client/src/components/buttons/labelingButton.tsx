import { ButtonProps, IconButton } from "@mui/material";
import { forwardRef } from "react";
import { ChevronDown, ChevronRight, Sparkles } from "lucide-react";

export const LabelingButton = forwardRef<HTMLButtonElement, ButtonProps>((props, ref) => {
  return (
    <IconButton
      ref={ref}
      {...props}
      color="ai"
      sx={{
        borderRadius: "4px",
      }}>
      <Sparkles />
    </IconButton>
  );
});

interface LabelingToggleButtonProps extends ButtonProps {
  panelOpen: boolean;
  panelPosition: "right" | "bottom";
}

export const LabelingToggleButton = forwardRef<HTMLButtonElement, LabelingToggleButtonProps>((props, ref) => {
  return (
    <IconButton
      ref={ref}
      {...props}
      color="ai"
      sx={{
        position: "absolute",
        zIndex: 1000,
        width: "44px",
        height: "44px",
        borderRadius: props.panelPosition === "right" ? "4px 0 0 4px" : "4px 0 0 0",
        right: 0,
        bottom: props.panelPosition === "bottom" ? "0" : undefined,
      }}>
      {props.panelOpen ? props.panelPosition === "right" ? <ChevronRight /> : <ChevronDown /> : <Sparkles />}
    </IconButton>
  );
});