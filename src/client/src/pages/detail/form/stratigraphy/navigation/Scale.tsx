import { FC, ReactNode, RefObject, useMemo, useRef, useState } from "react";
import { NumericFormat } from "react-number-format";
import { Box } from "@mui/material";
import { styled } from "@mui/material/styles";
import useResizeObserver from "@react-hook/resize-observer";
import { NavState } from "./navState.ts";

const isMajorNumber = (number: number, metersPerPattern: number): boolean => {
  const majorNumberInterval = metersPerPattern * 10;
  const remainder = number % majorNumberInterval;
  const epsilon = metersPerPattern / 2;
  return remainder < epsilon || remainder > majorNumberInterval - epsilon;
};

interface DepthLabelStyleProps {
  bottomPosition: number;
  isMajorNumber: boolean;
}

const DepthLabel = styled(NumericFormat, {
  shouldForwardProp: (prop: PropertyKey) =>
    typeof prop === "string" && !["bottomPosition", "isMajorNumber"].includes(prop),
})<DepthLabelStyleProps>(({ bottomPosition, isMajorNumber }) => ({
  position: "absolute",
  bottom: bottomPosition,
  left: 0,
  right: 0,
  fontSize: isMajorNumber ? "0.9em" : "0.8em",
  fontWeight: "bold",
  textAlign: "center",
  lineHeight: "1em",
}));

interface ScaleProps {
  navState: NavState;
}

export const Scale: FC<ScaleProps> = ({ navState }) => {
  const [width, setWidth] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  // Cast: @react-hook/resize-observer expects RefObject<HTMLElement>, but React 19's useRef returns RefObject<HTMLDivElement | null>.
  useResizeObserver(ref as RefObject<HTMLDivElement>, entry => setWidth(entry.contentRect.width));

  const state = useMemo(() => {
    const labels: ReactNode[] = [];
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
            fixedDecimalScale
            thousandSeparator="'"
            displayType="text"
          />,
        );
      }
    }

    return { numberLabels: labels, patternHeight, patternOffset };
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
