import { useMemo, useRef, useState } from "react";
import { NumericFormat } from "react-number-format";
import { Box } from "@mui/material";
import { styled } from "@mui/material/styles";
import useResizeObserver from "@react-hook/resize-observer";

const isMajorNumber = (number, metersPerPattern) => {
  const majorNumberInterval = metersPerPattern * 10;
  const remainder = number % majorNumberInterval;
  const epsilon = metersPerPattern / 2;
  return remainder < epsilon || remainder > majorNumberInterval - epsilon;
};

const DepthLabel = styled(NumericFormat, {
  shouldForwardProp: prop => !["bottomPosition", "isMajorNumber"].includes(prop),
})(({ bottomPosition, isMajorNumber }) => ({
  position: "absolute",
  bottom: bottomPosition,
  left: 0,
  right: 0,
  fontSize: isMajorNumber ? "0.9em" : "0.8em",
  fontWeight: "bold",
  textAlign: "center",
  lineHeight: "1em",
}));

const Scale = ({ navState }) => {
  const [width, setWidth] = useState(0);
  const ref = useRef(null);
  useResizeObserver(ref, entry => setWidth(entry.contentRect.width));

  const state = useMemo(() => {
    const labels = [];
    let patternHeight = 0;
    let patternOffset = 0;

    if (navState.lensSize > 0) {
      const minMetersPerPattern = width / navState.pixelPerMeter;
      const metersPerPattern = 10 ** Math.ceil(Math.log10(minMetersPerPattern));
      patternHeight = metersPerPattern * navState.pixelPerMeter;
      patternOffset = (navState.lensStart % metersPerPattern) * navState.pixelPerMeter;

      const lensEnd = navState.lensStart + navState.lensSize;
      for (
        let depth = Math.ceil(navState.lensStart / metersPerPattern) * metersPerPattern;
        depth <= lensEnd;
        depth += metersPerPattern
      ) {
        labels.push(
          <DepthLabel
            bottomPosition={(navState.lensSize - depth + navState.lensStart) * navState.pixelPerMeter}
            isMajorNumber={isMajorNumber(depth, metersPerPattern)}
            key={depth}
            value={depth}
            decimalScale={Math.max(0, -Math.log10(metersPerPattern))}
            fixedDecimalScale={true}
            thousandSeparator="'"
            displayType="text"
          />,
        );
      }
    }

    return {
      numberLabels: labels,
      patternHeight: patternHeight,
      patternOffset: patternOffset,
    };
  }, [navState, width]);

  return (
    <Box
      ref={ref}
      sx={{
        backgroundImage: "url(/img/scale.svg)",
        backgroundRepeatX: "no-repeat",
        backgroundRepeatY: "repeat",
        backgroundSize: `100% ${state.patternHeight}px`,
        backgroundPositionY: -state.patternOffset + "px",
        position: "absolute",
        top: navState.lensStart * navState.pixelPerMeter,
        left: 0,
        right: 0,
        height: navState.lensSize * navState.pixelPerMeter,
      }}>
      {state.numberLabels}
    </Box>
  );
};

export default Scale;
