import { ComponentPropsWithRef, FC } from "react";
import { useTranslation } from "react-i18next";
import { Box } from "@mui/material";
import { Info } from "lucide-react";
import { theme } from "../../../AppTheme.ts";

const visuallyHiddenSx = {
  position: "absolute",
  width: "1px",
  height: "1px",
  padding: 0,
  margin: "-1px",
  overflow: "hidden",
  clip: "rect(0 0 0 0)",
  whiteSpace: "nowrap",
  border: 0,
} as const;

/**
 * Marks something an automatic analysis wrote, and names it for assistive technology, which cannot
 * see the color. The props go to the marker element, so a Tooltip can wrap the badge directly.
 */
export const AnalysisBadge: FC<ComponentPropsWithRef<"span">> = ({ "aria-label": ariaLabel, ...props }) => {
  const { t } = useTranslation();

  return (
    <Box
      component="span"
      {...props}
      sx={{
        display: "inline-flex",
        borderRadius: "50%",
        backgroundColor: theme.palette.ai.secondary,
        color: theme.palette.secondary.main,
        p: "2px",
      }}>
      <Info size={12} aria-hidden />
      <Box component="span" sx={visuallyHiddenSx}>
        {/* A wrapping Tooltip passes its title as the label, and null when the title is not text. */}
        {ariaLabel ?? t("setByAutomaticAnalysis")}
      </Box>
    </Box>
  );
};
