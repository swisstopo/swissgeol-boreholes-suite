import { Box, Collapse, Paper } from "@mui/material";
import { theme } from "../../../AppTheme";

export const BottomDrawer = ({ drawerOpen, children }: { drawerOpen: boolean; children?: React.ReactNode }) => {
  return (
    <Box
      sx={{
        maxHeight: "40vh",
        position: "relative",
        top: 0,
        transition: "left 0.3s ease-out",
        "@media (max-height: 1200px)": {
          maxHeight: "60vh",
        },
      }}>
      <Collapse in={drawerOpen} orientation="vertical">
        <Paper
          sx={{
            padding: 2,
            height: "40vh",
            boxShadow: theme.palette.boxShadow + " 2px 6px 6px 0px",
            borderRight: "1px solid rgba(0, 0, 0, 0.12)",
            "@media (max-height: 1200px)": {
              height: "60vh",
            },
          }}>
          {children}
        </Paper>
      </Collapse>
    </Box>
  );
};
