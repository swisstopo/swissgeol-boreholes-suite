import { useTranslation } from "react-i18next";
import { useEffect, useRef } from "react";
import * as d3 from "d3";
import { Box, Stack, Typography } from "@mui/material";

const GeometryChartNE = ({ data }) => {
  const size = 500;
  const padding = { leftBottom: 30, topRight: 50 };
  const margin = { top: 30, right: 2, bottom: 2, left: 15 };
  const contentSize =
    size - padding.leftBottom - padding.topRight - Math.max(margin.right + margin.left, margin.top + margin.bottom);

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

  useEffect(() => {
    d3.select(axisXRef.current).call(d3.axisBottom(x));
  }, [axisXRef, x]);

  useEffect(() => {
    d3.select(axisYRef.current).call(d3.axisLeft(y));
  }, [axisYRef, y]);

  return (
    <Box sx={{ position: "relative" }}>
      <Stack sx={{ position: "absolute", left: 0, right: 0 }} alignItems="center">
        <Typography variant="h6">{t("topView")}</Typography>
      </Stack>
      <svg viewBox={`0 0 ${size} ${size}`}>
        <g transform={`translate(${padding.topRight + margin.left}, ${padding.leftBottom + margin.top})`}>
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
            <text x={contentSize / 2} dy={-padding.leftBottom} textAnchor="middle" dominantBaseline="hanging">
              N
            </text>
            <text
              x={contentSize}
              y={contentSize / 2}
              dx={padding.leftBottom}
              textAnchor="end"
              dominantBaseline="middle">
              {t("eastAbbr")}
            </text>
            <text x={contentSize / 2} y={contentSize} dy={padding.topRight} textAnchor="middle" dominantBaseline="auto">
              S
            </text>
            <text y={contentSize / 2} dx={-padding.topRight} textAnchor="start" dominantBaseline="middle">
              {t("westAbbr")}
            </text>
          </g>
          <path fill="none" stroke={d3.schemeCategory10[0]} strokeWidth={2} d={line(data)} strokeLinecap="round" />
        </g>
      </svg>
    </Box>
  );
};

export default GeometryChartNE;
