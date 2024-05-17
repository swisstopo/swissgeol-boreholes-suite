import { useTranslation } from "react-i18next";
import { useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import { Box, Slider, Stack, Typography } from "@mui/material";

/**
 * A {@link GeometryChartZAzimuth} component with a slider to change the azimuth.
 */
export const GeometryChartZInteractive = ({ data }) => {
  const [azimuth, setAzimuth] = useState(0);

  useEffect(() => {
    setAzimuth(data?.length > 0 ? Math.round((Math.atan2(data.at(-1).x, data.at(-1).y) * 180) / Math.PI + 180) : 0);
  }, [data]);

  return (
    <Box sx={{ position: "relative" }}>
      <GeometryChartZAzimuth data={data} azimuth={azimuth} />
      <Stack sx={{ position: "absolute", left: 0, right: 0, bottom: 0 }} direction="row" spacing={2}>
        <Slider size="small" value={azimuth} onChange={(e, value) => setAzimuth(value)} min={0} max={360} />
        <Typography>{`${azimuth}°\u00a0[m]`}</Typography>
      </Stack>
    </Box>
  );
};

export const GeometryChartZAzimuth = ({ data, azimuth = 0 }) => {
  // project data
  const azimuthRad = (azimuth * Math.PI) / 180;
  const factorX = Math.sin(azimuthRad);
  const factorY = Math.cos(azimuthRad);
  data = data.map(d => ({ y: d.z, x: d.x * factorX + d.y * factorY }));

  return GeometryChartZ({ data });
};

export const GeometryChartZN = ({ data }) => {
  data = data.map(d => ({ y: d.z, x: d.y }));
  return GeometryChartZ({ data, xLabel: "N [m]" });
};

export const GeometryChartZE = ({ data }) => {
  const { t } = useTranslation();
  data = data.map(d => ({ y: d.z, x: d.x }));
  return GeometryChartZ({ data, xLabel: t("eastAbbr") + " [m]" });
};

const GeometryChartZ = ({ data, xLabel }) => {
  const width = 500;
  const height = 500;
  const padding = { top: 20, right: 20, bottom: 40, left: 50 };
  const margin = 10;
  const contentWidth = width - padding.left - padding.right - margin * 2;
  const contentHeight = height - padding.top - padding.bottom - margin * 2;

  const { t } = useTranslation();
  const axisXRef = useRef(null);
  const axisYRef = useRef(null);

  // define scales
  const x = d3.scaleLinear([...d3.extent(data, d => d.x)], [0, contentWidth]).nice();
  const y = d3.scaleLinear([0, d3.max(data, d => d.y)], [0, contentHeight]).nice();

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
    <svg viewBox={`0 0 ${width} ${height}`}>
      <g transform={`translate(${padding.left + margin}, ${padding.top + margin})`}>
        <g stroke="lightgray" fill="none" strokeLinecap="square">
          {y.ticks().map((t, i) => (
            <line key={"y" + i} y1={y(t)} y2={y(t)} x2={contentWidth} />
          ))}
          {x.ticks().map((t, i) => (
            <line key={"x" + i} x1={x(t)} x2={x(t)} y2={contentHeight} strokeWidth={t === 0 ? 2.5 : null} />
          ))}
        </g>
        <g ref={axisXRef} transform={`translate(0, ${contentHeight})`} />
        <g ref={axisYRef} />
        <g>
          <text x={contentWidth} y={contentHeight} dy={padding.bottom} textAnchor="end" dominantBaseline="auto">
            {xLabel}
          </text>
          <text textAnchor="end" dominantBaseline="hanging" transform={`rotate(-90) translate(0 ${-padding.left})`}>
            {t("depthTVD")}
          </text>
        </g>
        <path fill="none" stroke={d3.schemeCategory10[0]} strokeWidth={2} d={line(data)} strokeLinecap="round" />
      </g>
    </svg>
  );
};
