import { FC, useMemo } from "react";
import { NumericFormat } from "react-number-format";
import { Box } from "@mui/material";
import { styled } from "@mui/material/styles";
import { theme } from "../../../../../AppTheme.ts";
import { NavState } from "./navState.ts";

type LabelAlignment = "below" | "center" | "above";

const translateByAlignment: Record<LabelAlignment, string> = {
  below: "translateY(140%)",
  center: "translateY(50%)",
  above: "translateY(-40%)",
};

interface DepthLabelStyleProps {
  bottomPosition: number;
  alignment: LabelAlignment;
}

const DepthLabel = styled(NumericFormat, {
  shouldForwardProp: (prop: PropertyKey) => typeof prop === "string" && !["bottomPosition", "alignment"].includes(prop),
})<DepthLabelStyleProps>(({ bottomPosition, alignment }) => ({
  position: "absolute",
  bottom: bottomPosition,
  left: 0,
  right: 0,
  fontSize: "16px",
  fontWeight: 400,
  textAlign: "center",
  lineHeight: "1em",
  transform: translateByAlignment[alignment],
}));

const TICK_LENGTH_PX = 12;
const LABELED_TICK_LENGTH_PX = 32;
const MIN_LABEL_GAP_PX = 28;

interface DiscreteScaleProps {
  navState: NavState;
  depths: ReadonlyArray<number>;
}

const selectLabelDepths = (visible: ReadonlyArray<number>, lensStart: number, pixelPerMeter: number): number[] => {
  // Greedy top-down pass: always include the first visible depth, then each subsequent
  // depth only if it sits at least MIN_LABEL_GAP_PX below the previously included one.
  const included: number[] = [];
  let lastY = -Infinity;
  for (const d of visible) {
    const y = (d - lensStart) * pixelPerMeter;
    if (included.length === 0 || y - lastY >= MIN_LABEL_GAP_PX) {
      included.push(d);
      lastY = y;
    }
  }

  // Bottom-anchor pass: ensure the deepest visible depth is always labelled. If it would
  // collide with the last included depth, replace that one rather than dropping the anchor.
  const deepest = visible.at(-1);
  const previous = included.at(-1);
  if (deepest !== undefined && previous !== undefined && previous !== deepest) {
    const yDeepest = (deepest - lensStart) * pixelPerMeter;
    const yPrevious = (previous - lensStart) * pixelPerMeter;
    if (yDeepest - yPrevious >= MIN_LABEL_GAP_PX) {
      included.push(deepest);
    } else {
      included[included.length - 1] = deepest;
    }
  }

  return included;
};

const tickBarSx = {
  position: "absolute" as const,
  bottom: 0,
  width: TICK_LENGTH_PX,
  height: "1px",
  backgroundColor: theme.palette.border.darker,
};

export const DiscreteScale: FC<DiscreteScaleProps> = ({ navState, depths }) => {
  const { ticks, labels, labeledDepths } = useMemo(() => {
    const normalized = Array.from(new Set(depths))
      .filter(Number.isFinite)
      .sort((a, b) => a - b);
    const visible = normalized.filter(d => d >= navState.lensStart && d <= navState.lensEnd);
    const selectedLabels = selectLabelDepths(visible, navState.lensStart, navState.pixelPerMeter);
    return {
      ticks: visible,
      labels: selectedLabels.map(d => {
        let alignment: LabelAlignment = "center";
        if (selectedLabels.length > 1 && d === 0) alignment = "below";
        else if (selectedLabels.length > 1 && d === normalized.at(-1)) alignment = "above";
        return { depth: d, alignment };
      }),
      labeledDepths: new Set(selectedLabels),
    };
  }, [depths, navState.lensStart, navState.lensEnd, navState.pixelPerMeter]);

  return (
    <Box
      sx={{
        position: "absolute",
        top: navState.lensStart * navState.pixelPerMeter,
        left: 0,
        right: 0,
        height: navState.lensSize * navState.pixelPerMeter,
      }}>
      {ticks.map(d => {
        const tickLength = labeledDepths.has(d) ? LABELED_TICK_LENGTH_PX : TICK_LENGTH_PX;
        return (
          <Box
            key={`tick-${d}`}
            data-cy="discrete-scale-tick"
            sx={{
              position: "absolute",
              bottom: (navState.lensEnd - d) * navState.pixelPerMeter,
              left: 0,
              right: 0,
              height: 0,
              pointerEvents: "none",
            }}>
            <Box sx={{ ...tickBarSx, width: tickLength, left: 0 }} />
            <Box sx={{ ...tickBarSx, width: tickLength, right: 0 }} />
          </Box>
        );
      })}
      {labels.map(({ depth, alignment }) => (
        <DepthLabel
          key={`label-${depth}`}
          data-cy="discrete-scale-label"
          alignment={alignment}
          bottomPosition={(navState.lensEnd - depth) * navState.pixelPerMeter}
          value={depth}
          decimalScale={2}
          fixedDecimalScale={false}
          thousandSeparator="'"
          displayType="text"
        />
      ))}
    </Box>
  );
};
