import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Box, Slider, Stack, Typography } from "@mui/material";
import * as d3 from "d3";

/**
 * A {@link GeometryChartZAzimuth} component with a slider to change the azimuth.
 */
export const GeometryChartZInteractive = ({ data }) => {
  const { t } = useTranslation();
  const [azimuth, setAzimuth] = useState(
    data?.length > 0 ? Math.round((Math.atan2(data.at(-1).x, data.at(-1).y) * 180) / Math.PI + 180) : 0,
  );

  // project data
  const azimuthRad = (azimuth * Math.PI) / 180;
  const factorX = Math.sin(azimuthRad);
  const factorY = Math.cos(azimuthRad);
  data = data.map(d => ({ y: d.z, x: d.x * factorX + d.y * factorY }));

  return (
    <Box sx={{ position: "relative" }}>
      <Stack sx={{ position: "absolute", left: 0, right: 0 }} alignItems="center">
        <Typography variant="h6">{`${t("profile")} ${(azimuth + 180) % 360}° - ${azimuth % 360}°`}</Typography>
        <Slider size="small" value={azimuth} onChange={(e, value) => setAzimuth(value)} min={0} max={360} />
      </Stack>
      <GeometryChartZ data={data} paddingTop={65} />
    </Box>
  );
};

export const GeometryChartZN = ({ data }) => {
  const { t } = useTranslation();
  data = data.map(d => ({ y: d.z, x: d.y }));

  return (
    <Box sx={{ position: "relative" }}>
      <Stack sx={{ position: "absolute", left: 0, right: 0 }} alignItems="center">
        <Typography variant="h6">{t("profileSouthNorth")}</Typography>
      </Stack>
      <GeometryChartZ data={data} />
    </Box>
  );
};

export const GeometryChartZE = ({ data }) => {
  const { t } = useTranslation();
  data = data.map(d => ({ y: d.z, x: d.x }));

  return (
    <Box sx={{ position: "relative" }}>
      <Stack sx={{ position: "absolute", left: 0, right: 0 }} alignItems="center">
        <Typography variant="h6">{t("profileWestEast")}</Typography>
      </Stack>
      <GeometryChartZ data={data} />
    </Box>
  );
};

const GeometryChartZ = ({ data, paddingTop = 35 }) => {
  const width = 500;
  const height = 500;
  const padding = { top: paddingTop, right: 20, bottom: 40, left: 60 };
  const margin = 2;
  const contentWidth = width - padding.left - padding.right - margin * 2;
  const contentHeight = height - padding.top - padding.bottom - margin * 2;

  const { t } = useTranslation();
  const axisXRef = useRef(null);
  const axisYRef = useRef(null);

  // define scales
  const x_extent = d3.extent(data, d => d.x);
  const y_extent = d3.extent(data, d => d.y);
  const x = d3.scaleLinear([Math.min(x_extent[0], -1), Math.max(x_extent[1], 1)], [0, contentWidth]).nice();
  const y = d3.scaleLinear([Math.min(y_extent[0], 0), Math.max(y_extent[1], 1)], [0, contentHeight]).nice();

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
    <svg viewBox={`0 0 ${width} ${height}`}>
      <g transform={`translate(${padding.left + margin}, ${padding.top + margin})`}>
        <g stroke="lightgray" fill="none" strokeLinecap="square">
          {y.ticks().map((t, i) => (
            <line key={"y" + i} y1={y(t)} y2={y(t)} x2={contentWidth} strokeWidth={t === 0 ? 2.5 : null} />
          ))}
          {x.ticks().map((t, i) => (
            <line key={"x" + i} x1={x(t)} x2={x(t)} y2={contentHeight} strokeWidth={t === 0 ? 2.5 : null} />
          ))}
        </g>
        <g ref={axisXRef} transform={`translate(0, ${contentHeight})`} />
        <g ref={axisYRef} />
        <g>
          <text x={contentWidth} y={contentHeight} dy={padding.bottom} textAnchor="end" dominantBaseline="auto">
            [m]
          </text>
          <text textAnchor="end" dominantBaseline="hanging" transform={`rotate(-90) translate(0 ${-padding.left})`}>
            {t("depthTVD")}
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
  );
};
