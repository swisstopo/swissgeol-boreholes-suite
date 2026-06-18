import { Dispatch, FC, ReactNode, RefObject, SetStateAction, useEffect, useRef, useState } from "react";
import Draggable, { DraggableData, DraggableEvent } from "react-draggable";
import { NumericFormat } from "react-number-format";
import { Box, Button, Stack } from "@mui/material";
import { styled, SxProps, Theme } from "@mui/material/styles";
import { ChevronDown, ChevronUp } from "lucide-react";
import { theme } from "../../../../../AppTheme.ts";
import { clamp } from "./clamp.ts";
import { NavState } from "./navState.ts";
import { useTypedResizeObserver } from "./useTypedResizeObserver.ts";

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

export const NavigationLens: FC<NavigationLensProps> = ({ navState, setNavState, sx, renderBackground }) => {
  const [backgroundNavState, setBackgroundNavState] = useState<NavState>(navState);
  const [cursor, setCursor] = useState<"grab" | "grabbing">("grab");

  const contentRef = useRef<HTMLDivElement>(null);
  const lensRef = useRef<HTMLDivElement>(null);
  useTypedResizeObserver(contentRef, entry => setBackgroundNavState(prev => prev.setHeight(entry.contentRect.height)));

  useEffect(() => {
    setBackgroundNavState(
      prev =>
        new NavState({
          ...prev,
          contentHeights: { ...navState.contentHeights },
        }),
    );
  }, [navState.contentHeights]);

  const handleDrag = (_e: DraggableEvent, data: DraggableData) => {
    const newValue = data.y / backgroundNavState.pixelPerMeter;
    if (!Number.isNaN(newValue) && newValue !== navState.lensStart) {
      setNavState(prev => prev.setLensStart(newValue));
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
      <Button onClick={() => handleMove(-0.3)} variant="outlined" onPointerDown={e => e.stopPropagation()}>
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
            bottom:
              (navState.maxContent - navState.lensStart) * backgroundNavState.pixelPerMeter -
              2 + // a bit less to prevent visual glitches
              "px",
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
          nodeRef={lensRef as RefObject<HTMLDivElement>}
          position={{
            y: navState.lensStart * backgroundNavState.pixelPerMeter,
            x: 0,
          }}
          onDrag={handleDrag}
          onStart={() => setCursor("grabbing")}
          onStop={() => setCursor("grab")}>
          <Box
            ref={lensRef}
            onPointerDown={e => e.stopPropagation()}
            sx={{
              cursor,
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
      <Button onClick={() => handleMove(0.3)} variant="outlined" onPointerDown={e => e.stopPropagation()}>
        <ChevronDown />
      </Button>
    </Stack>
  );
};
