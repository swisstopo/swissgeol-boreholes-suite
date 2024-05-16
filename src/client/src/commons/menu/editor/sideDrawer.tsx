import { Box, Collapse, Paper } from "@mui/material";
import { SideDrawerProps } from "./menuComponents/menuComponentInterfaces";
import { theme } from "../../../AppTheme";

export const SideDrawer = ({ drawerOpen, drawerWidth, drawerContent }: SideDrawerProps) => {
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
            width: drawerWidth,
            height: "100vh",
            padding: 2,
            boxShadow: theme.palette.boxShadow + " 2px 6px 6px 0px",
            borderRight: "1px solid rgba(0, 0, 0, 0.12)",
          }}>
          {drawerContent}
        </Paper>
      </Collapse>
    </Box>
  );
};
