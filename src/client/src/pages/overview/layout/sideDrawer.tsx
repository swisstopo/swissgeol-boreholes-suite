import React from "react";
import { Box, Collapse, Paper } from "@mui/material";
import { theme } from "../../../AppTheme.ts";

interface SideDrawerProps {
  drawerContent: React.JSX.Element;
  drawerOpen: boolean;
}

export const SideDrawer = ({ drawerOpen, drawerContent }: SideDrawerProps) => {
  return (
    <Box
      sx={{
        height: "100%",
        position: "relative",
        top: 0,
        transition: "left 0.3s ease-out",
      }}>
      <Collapse in={drawerOpen} orientation="horizontal">
        <Paper
          sx={{
            width: "360px",
            height: "calc(100vh - 84px)",
            padding: "16px",
            backgroundColor: theme.palette.background.lightgrey,
            boxShadow: theme.shadows[4],
            borderRight: "1px solid rgba(0, 0, 0, 0.12)",
          }}>
          {drawerContent}
        </Paper>
      </Collapse>
    </Box>
  );
};
