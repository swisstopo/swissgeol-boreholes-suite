import { Dispatch, FC, ReactNode, RefObject, SetStateAction, useRef, useState } from "react";
import { Box, SxProps, Theme } from "@mui/material";
import useResizeObserver from "@react-hook/resize-observer";
import { NavState } from "./navigationContainer";

interface NavigationChildProps {
  navState: NavState;
  setNavState: Dispatch<SetStateAction<NavState>>;
  header: ReactNode;
  children: ReactNode;
  sx?: SxProps<Theme>;
  moveChildren?: boolean;
}

/**
 * Positions its children according to the lensStart and lensSize properties of navState.
 * Handles the resizing of the header.
 */
const NavigationChild: FC<NavigationChildProps> = ({
  navState,
  setNavState,
  header,
  children,
  sx,
  moveChildren = true,
}) => {
  const [id] = useState<string>(Math.random().toString(36).substring(2, 10));

  const headerRef = useRef<HTMLDivElement>(null);
  useResizeObserver(headerRef as RefObject<HTMLElement>, entry => setNavState(prev => prev.setHeaderHeight(id, entry.contentRect.height)));

  return (
    <Box sx={{ flex: 1, ...sx, display: "flex", flexDirection: "column" }}>
      <Box
        sx={{
          flex: `0 0 ${navState.maxHeader}px`,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          textAlign: "center",
        }}>
        <Box ref={headerRef}>{header}</Box>
      </Box>
      {moveChildren ? (
        <Box sx={{ overflow: "hidden", flex: "1 1 100%", position: "relative" }}>
          <Box
            sx={{
              position: "absolute",
              top: -navState.pixelPerMeter * navState.lensStart,
              width: "100%",
            }}>
            {children}
          </Box>
        </Box>
      ) : (
        children
      )}
    </Box>
  );
};

export default NavigationChild;
