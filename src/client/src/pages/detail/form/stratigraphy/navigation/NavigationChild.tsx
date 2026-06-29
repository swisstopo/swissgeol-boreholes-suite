import { FC, ReactNode } from "react";
import { Box } from "@mui/material";
import { SxProps, Theme } from "@mui/material/styles";
import { NavState } from "./navState.ts";

interface NavigationChildProps {
  navState: NavState;
  children: ReactNode;
  sx?: SxProps<Theme>;
}

// Clips its children to the body row and slides them up by lensStart so depth-positioned cells
// render at the correct vertical position inside the viewport.
export const NavigationChild: FC<NavigationChildProps> = ({ navState, children, sx }) => (
  <Box sx={{ flex: 1, ...sx, overflow: "hidden", position: "relative" }}>
    <Box
      sx={{
        position: "absolute",
        top: -navState.pixelPerMeter * navState.lensStart,
        width: "100%",
      }}>
      {children}
    </Box>
  </Box>
);
