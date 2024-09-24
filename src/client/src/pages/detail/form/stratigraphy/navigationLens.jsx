import { useEffect, useRef, useState } from "react";
import DraggableCore from "react-draggable";
import { NumericFormat } from "react-number-format";
import { KeyboardArrowDown, KeyboardArrowUp } from "@mui/icons-material";
import { Box, Button, ButtonGroup } from "@mui/material";
import { styled } from "@mui/material/styles";
import useResizeObserver from "@react-hook/resize-observer";
import { theme } from "../../../../AppTheme.ts";
import { clamp } from "./clamp.js";
import { NavState } from "./navigationContainer.jsx";

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

const NavigationLens = ({ navState, setNavState, sx, renderBackground }) => {
  const [backgroundNavState, setBackgroundNavState] = useState(navState);
  const [cursor, setCursor] = useState("grab");

  const contentRef = useRef(null);
  useResizeObserver(contentRef, entry => setBackgroundNavState(prev => prev.setHeight(entry.contentRect.height)));

  useEffect(() => {
    setBackgroundNavState(
      prevState =>
        new NavState({
          ...prevState,
          contentHeights: { ...navState.contentHeights },
        }),
    );
  }, [navState.contentHeights]);

  const handleDrag = (e, data) => {
    const newValue = data.y / backgroundNavState.pixelPerMeter;
    if (!isNaN(newValue) && newValue !== navState?.lensStart) {
      setNavState(prevState => prevState.setLensStart(newValue));
    }
  };

  const handleMove = pageFraction =>
    setNavState(prev =>
      prev.setLensStart(clamp(prev.lensStart + prev.lensSize * pageFraction, 0, prev.maxContent - prev.lensSize)),
    );

  const minPixelHeightForDepthLabel = 50;
  const lensHeight =
    navState.lensSize === 0
      ? backgroundNavState.height
      : Math.max(12, navState.lensSize * backgroundNavState.pixelPerMeter);

  return (
    <ButtonGroup
      variant="contained"
      orientation="vertical"
      color="neutral"
      sx={{ flex: 1, ...sx, display: "flex", flexDirection: "column" }}>
      <Button onClick={() => handleMove(-0.3)}>
        <KeyboardArrowUp />
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
        <DraggableCore
          axis="y"
          bounds="parent"
          position={{
            y: navState.lensStart * backgroundNavState.pixelPerMeter,
            x: 0,
          }}
          onDrag={handleDrag}
          onStart={() => setCursor("grabbing")}
          onStop={() => setCursor("grab")}>
          <Box
            sx={{
              cursor: cursor,
              height: lensHeight + "px",
              position: "absolute",
              left: 0,
              right: 0,
              top: 0,
              bottom: 0,
              borderStyle: "solid",
              borderWidth: "4px",
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
        </DraggableCore>
      </Box>
      <Button onClick={() => handleMove(0.3)}>
        <KeyboardArrowDown />
      </Button>
    </ButtonGroup>
  );
};

export default NavigationLens;
