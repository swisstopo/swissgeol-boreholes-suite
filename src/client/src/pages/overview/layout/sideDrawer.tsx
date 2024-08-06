import { Box, Collapse, Paper } from "@mui/material";
import { SideDrawerProps } from "../../../commons/filter/menuItemsInterfaces.ts";
import { theme } from "../../../AppTheme.ts";

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
            boxShadow: theme.palette.boxShadow + " 2px 6px 6px 0px",
            borderRight: "1px solid rgba(0, 0, 0, 0.12)",
          }}>
          {drawerContent}
        </Paper>
      </Collapse>
    </Box>
  );
};
