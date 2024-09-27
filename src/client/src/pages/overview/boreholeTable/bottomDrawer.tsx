import { Box, Collapse, Paper } from "@mui/material";

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
            boxShadow: 4,
            borderRight: "1px solid rgba(0, 0, 0, 0.12)",
          }}>
          {children}
        </Paper>
      </Collapse>
    </Box>
  );
};
