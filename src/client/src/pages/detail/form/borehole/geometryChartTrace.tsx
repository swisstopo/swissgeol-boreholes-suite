import { FC } from "react";
import * as d3 from "d3";

export interface ChartPoint {
  x: number;
  y: number;
}

type LinearScale = d3.ScaleLinear<number, number>;

interface GeometryChartTraceProps {
  data: ChartPoint[];
  x: LinearScale;
  y: LinearScale;
}

// Renders the borehole trace as a line, with a cross marking its first point.
export const GeometryChartTrace: FC<GeometryChartTraceProps> = ({ data, x, y }) => {
  const line = d3
    .line<ChartPoint>()
    .x(d => x(d.x))
    .y(d => y(d.y));

  return (
    <>
      <path
        fill="none"
        stroke={d3.schemeCategory10[0]}
        strokeWidth={2}
        d={line(data) ?? undefined}
        strokeLinecap="round"
      />
      {data.length > 0 && (
        <path
          d={`${d3.symbol(d3.symbolTimes)()}`}
          fill="none"
          stroke={d3.schemeCategory10[0]}
          transform={`translate(${x(data[0].x)},${y(data[0].y)})`}
        />
      )}
    </>
  );
};
