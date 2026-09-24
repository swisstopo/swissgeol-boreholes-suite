import { ComponentPropsWithRef, FC } from "react";
import { Box } from "@mui/material";
import { Info } from "lucide-react";
import { theme } from "../../../AppTheme.ts";

/**
 * Marks something an automatic analysis wrote. The props go to the marker element, so a Tooltip
 * can wrap the badge directly.
 */
export const AnalysisBadge: FC<ComponentPropsWithRef<"span">> = props => (
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
    <Info size={12} />
  </Box>
);
