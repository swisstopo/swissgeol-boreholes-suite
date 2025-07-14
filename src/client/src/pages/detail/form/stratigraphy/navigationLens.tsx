import { Dispatch, FC, ReactNode, RefObject, SetStateAction, useEffect, useRef, useState } from "react";
import type { DraggableData, DraggableEvent } from "react-draggable";
import Draggable from "react-draggable";
import { NumericFormat } from "react-number-format";
import { Box, Button, Stack, SxProps, Theme } from "@mui/material";
import { styled } from "@mui/material/styles";
import { ChevronDown, ChevronUp } from "lucide-react";
import useResizeObserver from "@react-hook/resize-observer";
import { theme } from "../../../../AppTheme.ts";
import { clamp } from "./clamp.js";
import { NavState } from "./navigationContainer";

const BackgroundShade = styled(Box)(() => ({
  position: "absolute",
  background: "rgba(0, 0, 0, 0.3)",
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
}));

const LensDepthLabel = styled(NumericFormat)(() => ({
  fontSize: "0.8em",
  fontWeight: "bold",
  textAlign: "center",
  color: "black",
}));

interface NavigationLensProps {
  navState: NavState;
  setNavState: Dispatch<SetStateAction<NavState>>;
  sx?: SxProps<Theme>;
  renderBackground: (navState: NavState, setNavState: Dispatch<SetStateAction<NavState>>) => ReactNode;
}

const NavigationLens: FC<NavigationLensProps> = ({ navState, setNavState, sx, renderBackground }) => {
  const [backgroundNavState, setBackgroundNavState] = useState<NavState>(navState);
  const [cursor, setCursor] = useState<string>("grab");

  const contentRef = useRef<HTMLDivElement>(null);
  const lensRef = useRef<HTMLElement>(null!);
  useResizeObserver(contentRef as RefObject<HTMLElement>, entry =>
    setBackgroundNavState(prev => prev.setHeight(entry.contentRect.height)),
  );

  useEffect(() => {
    setBackgroundNavState(
      prevState =>
        new NavState({
          ...prevState,
          contentHeights: { ...navState.contentHeights },
        }),
    );
  }, [navState.contentHeights]);

  const handleDrag = (_e: DraggableEvent, data: DraggableData) => {
    const newValue = data.y / backgroundNavState.pixelPerMeter;
    if (!isNaN(newValue) && newValue !== navState?.lensStart) {
      setNavState(prevState => prevState.setLensStart(newValue));
    }
  };

  const handleMove = (pageFraction: number) =>
    setNavState(prev =>
      prev.setLensStart(clamp(prev.lensStart + prev.lensSize * pageFraction, 0, prev.maxContent - prev.lensSize)),
    );

  const minPixelHeightForDepthLabel = 50;
  const lensHeight =
    navState.lensSize === 0
      ? backgroundNavState.height
      : Math.max(12, navState.lensSize * backgroundNavState.pixelPerMeter);

  return (
    <Stack gap={1} flex={1} sx={{ width: "45px", ...sx }}>
      <Button onClick={() => handleMove(-0.3)} variant="outlined">
        <ChevronUp />
      </Button>
      <Box
        ref={contentRef}
        sx={{
          flex: "1",
          display: "block",
          position: "relative",
          background: theme.palette.neutral.main,
        }}>
        {renderBackground(backgroundNavState, setBackgroundNavState)}
        <BackgroundShade
          sx={{
            bottom: (navState.maxContent - navState.lensStart) * backgroundNavState.pixelPerMeter - 2 + "px",
          }}
        />
        <BackgroundShade
          sx={{
            top: navState.lensStart * backgroundNavState.pixelPerMeter + lensHeight + "px",
          }}
        />
        <Draggable
          axis="y"
          bounds="parent"
          nodeRef={lensRef}
          position={{
            y: navState.lensStart * backgroundNavState.pixelPerMeter,
            x: 0,
          }}
          onDrag={handleDrag}
          onStart={() => setCursor("grabbing")}
          onStop={() => setCursor("grab")}>
          <Box
            ref={lensRef}
            sx={{
              cursor: cursor,
              height: lensHeight + "px",
              position: "absolute",
              left: 0,
              right: 0,
              top: 0,
              bottom: 0,
              borderStyle: "solid",
              borderWidth: "2px",
              borderColor: "red",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
            }}>
            {lensHeight > minPixelHeightForDepthLabel && (
              <>
                <LensDepthLabel value={Math.round(navState.lensStart)} thousandSeparator="'" displayType="text" />
                <LensDepthLabel
                  value={Math.round(navState.lensStart + navState.lensSize)}
                  thousandSeparator="'"
                  displayType="text"
                />
              </>
            )}
          </Box>
        </Draggable>
      </Box>
      <Button onClick={() => handleMove(0.3)} variant="outlined">
        <ChevronDown />
      </Button>
    </Stack>
  );
};

export default NavigationLens;
