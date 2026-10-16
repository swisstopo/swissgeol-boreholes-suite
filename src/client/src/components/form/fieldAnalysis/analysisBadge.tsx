import { ComponentPropsWithRef, FC } from "react";
import { useTranslation } from "react-i18next";
import { Box } from "@mui/material";
import { Info } from "lucide-react";
import { theme } from "../../../AppTheme.ts";

/**
 * Marks something an automatic analysis wrote, and names it for assistive technology, which cannot
 * see the colour. The props go to the marker element, so a Tooltip can wrap the badge directly.
 */
export const AnalysisBadge: FC<ComponentPropsWithRef<"span">> = props => {
  const { t } = useTranslation();

  return (
    <Box
      component="span"
      role="img"
      {...props}
      // A wrapping Tooltip passes its title as the label, and null when the title is not text.
      aria-label={props["aria-label"] ?? t("setByAutomaticAnalysis")}
      sx={{
        display: "inline-flex",
        borderRadius: "50%",
        backgroundColor: theme.palette.ai.secondary,
        color: theme.palette.secondary.main,
        p: "2px",
      }}>
      <Info size={12} />
    </Box>
  );
};
