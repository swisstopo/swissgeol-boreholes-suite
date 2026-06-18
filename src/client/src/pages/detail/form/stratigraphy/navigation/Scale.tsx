import { FC, ReactNode, useMemo, useRef, useState } from "react";
import { NumericFormat } from "react-number-format";
import { Box } from "@mui/material";
import { styled } from "@mui/material/styles";
import { NavState } from "./navState.ts";
import { useTypedResizeObserver } from "./useTypedResizeObserver.ts";

interface DepthLabelStyleProps {
  bottomPosition: number;
}

const DepthLabel = styled(NumericFormat, {
  shouldForwardProp: (prop: PropertyKey) => typeof prop === "string" && prop !== "bottomPosition",
})<DepthLabelStyleProps>(({ bottomPosition }) => ({
  position: "absolute",
  bottom: bottomPosition,
  left: 0,
  right: 0,
  fontSize: "16px",
  fontWeight: 400,
  textAlign: "center",
  lineHeight: "1em",
}));

interface ScaleProps {
  navState: NavState;
}

export const Scale: FC<ScaleProps> = ({ navState }) => {
  const [width, setWidth] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  useTypedResizeObserver(ref, entry => setWidth(entry.contentRect.width));

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
        backgroundPositionY: -state.patternOffset - 0.5 + "px",
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
