import CloseIcon from "@mui/icons-material/Close";
import { Box, IconButton, Typography } from "@mui/material";
import { theme } from "../../../AppTheme.ts";

export function SideDrawerHeader({ title, toggleDrawer }: { title: string; toggleDrawer: (open: boolean) => void }) {
  return (
    <Box
      sx={{
        display: "flex",
        height: "70px",
        alignItems: "center",
        justifyContent: "flex-start",
        borderBottom: "1px solid " + theme.palette.border.light,
        marginBottom: "24px",
      }}>
      <Typography variant="h4" sx={{ flexGrow: 1 }}>
        {title}
      </Typography>
      <IconButton onClick={() => toggleDrawer(false)} sx={{ marginRight: "6px" }}>
        <CloseIcon />
      </IconButton>
    </Box>
  );
}
