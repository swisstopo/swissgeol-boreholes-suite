import { useEffect, useRef } from "react";
import * as d3 from "d3";

const formatTick = d3
  .formatLocale({
    decimal: ".",
    thousands: "'",
    grouping: [3],
    currency: ["", ""],
  })
  .format(",.1f");

// Draws the bottom and left axes into the returned refs, which must be attached to <g> elements.
export const useGeometryChartAxes = (x: d3.ScaleLinear<number, number>, y: d3.ScaleLinear<number, number>) => {
  const axisXRef = useRef<SVGGElement>(null);
  const axisYRef = useRef<SVGGElement>(null);

  useEffect(() => {
    if (axisXRef.current) {
      d3.select(axisXRef.current).call(d3.axisBottom(x).tickFormat(formatTick));
    }
  }, [x]);

  useEffect(() => {
    if (axisYRef.current) {
      d3.select(axisYRef.current).call(d3.axisLeft(y).tickFormat(formatTick));
    }
  }, [y]);

  return { axisXRef, axisYRef };
};
