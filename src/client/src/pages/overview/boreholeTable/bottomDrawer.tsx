import { Box, Collapse, Paper } from "@mui/material";
import { theme } from "../../../AppTheme.ts";

export const BottomDrawer = ({ drawerOpen, children }: { drawerOpen: boolean; children?: React.ReactNode }) => {
  return (
    <Box
      sx={{
        maxHeight: "50vh",
        position: "relative",
        top: 0,
        transition: "left 0.3s ease-out",
      }}>
      <Collapse in={drawerOpen} orientation="vertical">
        <Paper
          sx={{
            boxShadow: "none !important",
            padding: 2,
            height: "50vh",
            borderRight: `1px solid ${theme.palette.border.light}`,
            backgroundColor: theme.palette.background.lightgrey,
          }}>
          {children}
        </Paper>
      </Collapse>
    </Box>
  );
};
