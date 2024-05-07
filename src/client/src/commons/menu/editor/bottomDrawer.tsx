import { Box, Collapse, Paper } from "@mui/material";
import { theme } from "../../../AppTheme";

export const BottomDrawer = ({
  drawerOpen,
  children,
}: {
  drawerOpen: boolean;
  toggleDrawer: (open: boolean) => () => void;
  children?: React.ReactNode;
}) => {
  return (
    <Box
      sx={{
        maxHeight: "35vh",
        position: "relative",
        top: 0,
        transition: "left 0.3s ease-out",
      }}>
      <Collapse in={drawerOpen} orientation="vertical">
        <Paper
          sx={{
            padding: 2,
            height: "35vh",
            boxShadow: theme.palette.boxShadow + " 2px 6px 6px 0px",
            borderRight: "1px solid rgba(0, 0, 0, 0.12)",
          }}>
          {children}
        </Paper>
      </Collapse>
    </Box>
  );
};
