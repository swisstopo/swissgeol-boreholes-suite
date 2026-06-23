import { Dispatch, FC, ReactNode, RefObject, SetStateAction, useEffect, useRef, useState } from "react";
import Draggable, { DraggableData, DraggableEvent } from "react-draggable";
import { NumericFormat } from "react-number-format";
import { Box, Button } from "@mui/material";
import { styled } from "@mui/material/styles";
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
  renderBackground: (navState: NavState, setNavState: Dispatch<SetStateAction<NavState>>) => ReactNode;
}

// Renders the three pieces (lens-up button, lens body, lens-down button) as a fragment with
// grid-area assignments (lens-up / lens-body / lens-down). The parent CSS grid is responsible
// for placing them — typically lens-up in the header row, lens-body in the body row, and
// lens-down in a tail row — so the lens column lines up with the table next to it.
export const NavigationLens: FC<NavigationLensProps> = ({ navState, setNavState, renderBackground }) => {
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

  const upButton = (
    <Button
      onClick={() => handleMove(-0.3)}
      variant="outlined"
      onPointerDown={e => e.stopPropagation()}
      // alignSelf: "end" prevents the button from stretching to the auto-sized header row's full
      // height, so it stays at its intrinsic content height and visually matches the lens-down
      // button. The button sits flush against the top of the lens body.
      sx={{ gridArea: "lens-up", minHeight: 0, mb: 1, alignSelf: "end" }}>
      <ChevronUp />
    </Button>
  );

  const bodyBox = (
    <Box
      ref={contentRef}
      sx={{
        display: "block",
        position: "relative",
        background: theme.palette.neutral.main,
        gridArea: "lens-body",
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
            borderColor: theme.palette.error.main,
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
  );

  const downButton = (
    <Button
      onClick={() => handleMove(0.3)}
      variant="outlined"
      onPointerDown={e => e.stopPropagation()}
      // alignSelf: "start" so the button stays at intrinsic content height at the top of its
      // tail row even if the row would otherwise stretch (e.g. if the grid places content like
      // an AddRowButton next to it).
      sx={{ gridArea: "lens-down", minHeight: 0, mt: 1, alignSelf: "start" }}>
      <ChevronDown />
    </Button>
  );

  return (
    <>
      {upButton}
      {bodyBox}
      {downButton}
    </>
  );
};
