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
            padding: 2,
            height: "50vh",
            boxShadow: theme.palette.boxShadow + " 2px 6px 6px 0px",
            borderRight: "1px solid rgba(0, 0, 0, 0.12)",
          }}>
          {children}
        </Paper>
      </Collapse>
    </Box>
  );
};
