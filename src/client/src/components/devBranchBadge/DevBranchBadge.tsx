import { FC } from "react";
import { Box } from "@mui/material";
import { theme } from "../../AppTheme.ts";
import { useDevBranch } from "./useDevBranch";

export const DevBranchBadge: FC = () => {
  const branch = useDevBranch();
  if (!branch || branch === "unknown") return null;

  return (
    <Box
      sx={{
        position: "fixed",
        top: 32,
        left: "50%",
        fontFamily: "monospace",
        transform: "translateX(-50%)",
        zIndex: theme.zIndex.tooltip + 1,
        px: 1,
        py: 0.25,
        borderRadius: "4px",
        fontSize: "0.75rem",
        lineHeight: 1.4,
        color: theme.palette.primary.contrastText,
        backgroundColor: theme.palette.primary.main,
      }}>
      {branch}
    </Box>
  );
};
