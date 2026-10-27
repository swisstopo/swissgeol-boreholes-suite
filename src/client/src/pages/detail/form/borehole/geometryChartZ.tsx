import { FC, useState } from "react";
import { useTranslation } from "react-i18next";
import { Box, Slider, Stack, Typography } from "@mui/material";
import * as d3 from "d3";
import { BoreholeGeometryPoint } from "../../../../api/fetchApiV2.ts";
import { ChartPoint, GeometryChartTrace } from "./geometryChartTrace.tsx";
import { useGeometryChartAxes } from "./useGeometryChartAxes.ts";

interface GeometryChartsProps {
  data: BoreholeGeometryPoint[];
}

/**
 * A {@link GeometryChartZAzimuth} component with a slider to change the azimuth.
 */
export const GeometryChartZInteractive: FC<GeometryChartsProps> = ({ data }) => {
  const { t } = useTranslation();
  const [azimuth, setAzimuth] = useState(() => {
    const last = data.at(-1);
    return last ? Math.round((Math.atan2(last.x, last.y) * 180) / Math.PI + 180) : 0;
  });

  // project data
  const azimuthRad = (azimuth * Math.PI) / 180;
  const factorX = Math.sin(azimuthRad);
  const factorY = Math.cos(azimuthRad);
  const projected = data.map(d => ({ y: d.z, x: d.x * factorX + d.y * factorY }));
  const title = `${t("profile")} ${(azimuth + 180) % 360}° - ${azimuth % 360}°`;

  return (
    <Box sx={{ position: "relative" }}>
      <Stack sx={{ position: "absolute", left: 0, right: 0 }} alignItems="center">
        <Typography variant="h6">{title}</Typography>
        <Slider
          size="small"
          value={azimuth}
          onChange={(_e, value) => {
            if (typeof value === "number") setAzimuth(value);
          }}
          min={0}
          max={360}
        />
      </Stack>
      <GeometryChartZ data={projected} title={title} paddingTop={65} />
    </Box>
  );
};

export const GeometryChartZN: FC<GeometryChartsProps> = ({ data }) => {
  const { t } = useTranslation();
  const projected = data.map(d => ({ y: d.z, x: d.y }));

  return (
    <Box sx={{ position: "relative" }}>
      <Stack sx={{ position: "absolute", left: 0, right: 0 }} alignItems="center">
        <Typography variant="h6">{t("profileSouthNorth")}</Typography>
      </Stack>
      <GeometryChartZ data={projected} title={t("profileSouthNorth")} />
    </Box>
  );
};

export const GeometryChartZE: FC<GeometryChartsProps> = ({ data }) => {
  const { t } = useTranslation();
  const projected = data.map(d => ({ y: d.z, x: d.x }));

  return (
    <Box sx={{ position: "relative" }}>
      <Stack sx={{ position: "absolute", left: 0, right: 0 }} alignItems="center">
        <Typography variant="h6">{t("profileWestEast")}</Typography>
      </Stack>
      <GeometryChartZ data={projected} title={t("profileWestEast")} />
    </Box>
  );
};

interface GeometryChartZProps {
  data: ChartPoint[];
  title: string; // accessible name of the chart, matching its visible heading
  paddingTop?: number;
}

const GeometryChartZ: FC<GeometryChartZProps> = ({ data, title, paddingTop = 35 }) => {
  const width = 500;
  const height = 500;
  const padding = { top: paddingTop, right: 20, bottom: 40, left: 60 };
  const margin = 2;
  const contentWidth = width - padding.left - padding.right - margin * 2;
  const contentHeight = height - padding.top - padding.bottom - margin * 2;

  const { t } = useTranslation();

  // define scales
  const x_extent = d3.extent(data, d => d.x);
  const y_extent = d3.extent(data, d => d.y);
  const x = d3
    .scaleLinear([Math.min(x_extent[0] ?? Number.NaN, -1), Math.max(x_extent[1] ?? Number.NaN, 1)], [0, contentWidth])
    .nice();
  const y = d3
    .scaleLinear([Math.min(y_extent[0] ?? Number.NaN, 0), Math.max(y_extent[1] ?? Number.NaN, 1)], [0, contentHeight])
    .nice();

  const { axisXRef, axisYRef } = useGeometryChartAxes(x, y);

  return (
    <svg viewBox={`0 0 ${width} ${height}`} aria-label={title}>
      <g transform={`translate(${padding.left + margin}, ${padding.top + margin})`}>
        <g stroke="lightgray" fill="none" strokeLinecap="square">
          {y.ticks().map((t, i) => (
            <line key={"y" + i} y1={y(t)} y2={y(t)} x2={contentWidth} strokeWidth={t === 0 ? 2.5 : undefined} />
          ))}
          {x.ticks().map((t, i) => (
            <line key={"x" + i} x1={x(t)} x2={x(t)} y2={contentHeight} strokeWidth={t === 0 ? 2.5 : undefined} />
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
        <GeometryChartTrace data={data} x={x} y={y} />
      </g>
    </svg>
  );
};
