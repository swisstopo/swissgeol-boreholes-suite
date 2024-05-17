import { useTranslation } from "react-i18next";
import { useEffect, useRef } from "react";
import * as d3 from "d3";

const GeometryChartNE = ({ data }) => {
  const size = 500;
  const padding = { right: 30, left: 50 };
  const margin = 10;
  const contentSize = size - padding.right - padding.left - margin * 2;

  const { t } = useTranslation();
  const axisXRef = useRef(null);
  const axisYRef = useRef(null);

  // define scales
  const maxExtent = Math.sqrt(d3.max(data, d => d.x * d.x + d.y * d.y)) || 100;
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
    <svg viewBox={`0 0 ${size} ${size}`}>
      <g transform={`translate(${padding.left + margin}, ${padding.right + margin})`}>
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
          <text x={contentSize / 2} dy={-padding.right} textAnchor="middle" dominantBaseline="hanging">
            N
          </text>
          <text x={contentSize} y={contentSize / 2} dx={padding.right} textAnchor="end" dominantBaseline="middle">
            {t("eastAbbr")}
          </text>
          <text x={contentSize / 2} y={contentSize} dy={padding.left} textAnchor="middle" dominantBaseline="auto">
            S
          </text>
          <text y={contentSize / 2} dx={-padding.left} textAnchor="start" dominantBaseline="middle">
            W
          </text>
        </g>
        <path fill="none" stroke={d3.schemeCategory10[0]} strokeWidth={2} d={line(data)} strokeLinecap="round" />
      </g>
    </svg>
  );
};

export default GeometryChartNE;
