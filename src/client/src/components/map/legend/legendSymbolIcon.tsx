import { FC, useId } from "react";
import { theme } from "../../../AppTheme.ts";
import { LegendSymbol } from "./legendSymbols.ts";

interface LegendSymbolIconProps {
  symbol: LegendSymbol;
}

// The shadow is cast by a slightly smaller copy of the symbol, like on the map.
const shadowTransform = "translate(15 15) scale(0.875) translate(-15 -15)";

/**
 * Draws a legend symbol as SVG, from the same definition the map draws on its canvas.
 */
export const LegendSymbolIcon: FC<LegendSymbolIconProps> = ({ symbol }) => {
  // React ids contain characters that would need escaping in url() references.
  const id = useId().replaceAll(/[^\w-]/g, "");
  const shadowId = `${id}-shadow`;
  const clipId = `${id}-clip`;

  return (
    <svg width={30} height={30} viewBox="0 0 30 30" aria-hidden="true" style={{ flexShrink: 0, overflow: "visible" }}>
      <defs>
        <filter id={shadowId} x="-50%" y="-50%" width="200%" height="200%">
          <feDropShadow dx={0} dy={2} stdDeviation={3} floodColor={symbol.shadow} />
        </filter>
        {symbol.strokeInside && (
          <clipPath id={clipId}>
            <path d={symbol.path} />
          </clipPath>
        )}
      </defs>
      <path d={symbol.path} fill={symbol.fill} filter={`url(#${shadowId})`} transform={shadowTransform} />
      <path d={symbol.path} fill={symbol.fill} />
      <path
        d={symbol.strokePath}
        fill="none"
        stroke={symbol.stroke}
        strokeWidth={symbol.strokeWidth}
        strokeLinejoin="round"
        clipPath={symbol.strokeInside ? `url(#${clipId})` : undefined}
      />
      <path
        d={symbol.haloPath}
        fill="none"
        stroke={theme.palette.map.symbolHalo}
        strokeWidth={symbol.haloWidth}
        strokeLinejoin="round"
      />
    </svg>
  );
};
