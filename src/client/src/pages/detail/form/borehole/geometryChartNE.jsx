import { useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { Box, Stack, Typography } from "@mui/material";
import * as d3 from "d3";

const GeometryChartNE = ({ data }) => {
  const size = 500;
  const padding = { top: 35, right: 20, bottom: 40, left: 60 };
  const margin = 2;
  const contentSize = size - 2 * margin - Math.max(padding.right + padding.left, padding.top + padding.bottom);

  const { t } = useTranslation();
  const axisXRef = useRef(null);
  const axisYRef = useRef(null);

  // define scales
  const maxExtent = Math.max(Math.sqrt(d3.max(data, d => d.x * d.x + d.y * d.y)) || 0, 1);
  const x = d3.scaleLinear().domain([-maxExtent, maxExtent]).range([0, contentSize]).nice();
  const y = d3.scaleLinear().domain([-maxExtent, maxExtent]).range([contentSize, 0]).nice();

  const line = d3
    .line()
    .x(d => x(d.x))
    .y(d => y(d.y));

  const numberFormatLocale = d3.formatLocale({
    decimal: ".",
    thousands: "'",
    grouping: [3],
  });
  useEffect(() => {
    d3.select(axisXRef.current).call(d3.axisBottom(x).tickFormat(numberFormatLocale.format(",.1f")));
  }, [axisXRef, x, numberFormatLocale]);

  useEffect(() => {
    d3.select(axisYRef.current).call(d3.axisLeft(y).tickFormat(numberFormatLocale.format(",.1f")));
  }, [axisYRef, y, numberFormatLocale]);

  return (
    <Box sx={{ position: "relative" }}>
      <Stack sx={{ position: "absolute", left: 0, right: 0 }} alignItems="center">
        <Typography variant="h6">{t("topView")}</Typography>
      </Stack>
      <svg viewBox={`0 0 ${size} ${size}`}>
        <g transform={`translate(${padding.left + margin}, ${padding.top + margin})`}>
          <g stroke="lightgray" fill="none" strokeLinecap="square">
            {x
              .ticks()
              .filter(t => t > 0)
              .map((t, i) => (
                <circle key={"c" + i} cx={contentSize / 2} cy={contentSize / 2} r={x(t) - x(0)} />
              ))}
            {x.ticks().map((t, i) => (
              <line key={"x" + i} x1={x(t)} x2={x(t)} y2={contentSize} strokeWidth={t === 0 ? 2.5 : null} />
            ))}
            {y.ticks().map((t, i) => (
              <line key={"y" + i} y1={y(t)} y2={y(t)} x2={contentSize} strokeWidth={t === 0 ? 2.5 : null} />
            ))}
          </g>
          <g ref={axisXRef} transform={`translate(0, ${contentSize})`} />
          <g ref={axisYRef} />
          <g>
            <text x={contentSize} y={contentSize} dy={padding.bottom} textAnchor="end" dominantBaseline="auto">
              {t("geometryChartNEScaleXLabel")} [m]
            </text>
            <text textAnchor="end" dominantBaseline="hanging" transform={`rotate(-90) translate(0 ${-padding.left})`}>
              {t("geometryChartNEScaleYLabel")} [m]
            </text>
          </g>
          <path fill="none" stroke={d3.schemeCategory10[0]} strokeWidth={2} d={line(data)} strokeLinecap="round" />
          {data.length > 0 && (
            <path
              d={`${d3.symbol(d3.symbolTimes)()}`}
              fill="none"
              stroke={d3.schemeCategory10[0]}
              transform={`translate(${x(data[0].x)},${y(data[0].y)})`}
            />
          )}
        </g>
      </svg>
    </Box>
  );
};

export default GeometryChartNE;
