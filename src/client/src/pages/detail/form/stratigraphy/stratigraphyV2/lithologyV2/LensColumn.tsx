import { FC, ReactNode } from "react";
import { SxProps } from "@mui/material";
import { BaseLayer } from "../../../../../../api/stratigraphy.ts";
import { theme } from "../../../../../../AppTheme.ts";
import { Codelist } from "../../../../../../components/codelist.ts";
import { Lithology, LithologyDescription } from "../../lithology.ts";
import {
  StratigraphyTableActionCell,
  StratigraphyTableCellRow,
  StratigraphyTableColumn,
  StratigraphyViewTableCell,
} from "../stratigraphyTableComponents.tsx";

interface LensColumnProps {
  layers: BaseLayer[];
  renderLayer: (layer: BaseLayer) => ReactNode;
  colorAttribute: keyof LithologyDescription | null;
  tableHeight: number;
  sx?: SxProps;
}

export const LensColumn: FC<LensColumnProps> = ({ layers, renderLayer, colorAttribute, tableHeight, sx }) => {
  const maxDepth = layers.length > 0 ? Math.max(...layers.map(l => l.toDepth || 0)) : 0;
  const pxPerMeter = tableHeight / maxDepth;

  const getColor = (lithology: Lithology) => {
    const colorCodelist: Codelist = lithology?.lithologyDescriptions?.find(
      (desc: LithologyDescription) => desc.isFirst,
    )?.[colorAttribute] as Codelist;
    const colorArray = (colorAttribute && JSON.parse(colorCodelist?.conf ?? null)?.color) || null;
    return colorArray
      ? `rgb(${colorArray[0]}, ${colorArray[1]}, ${colorArray[2]})`
      : theme.palette.background.lightgrey;
  };

  return (
    <StratigraphyTableColumn sx={{ position: "relative", height: "100%", ...sx }}>
      {layers.map((layer: BaseLayer, index: number) => {
        const { id, fromDepth, toDepth, isGap } = layer;
        const top = fromDepth * pxPerMeter;
        const height = (toDepth - fromDepth) * pxPerMeter;
        // Todo: Account for scale in border width
        // Todo: Fix bug where border length does not scale
        const viewCellStyles = {
          borderLeft: `1px solid ${theme.palette.border.darker}`,
          borderRight: `1px solid ${theme.palette.border.darker}`,
          borderTop: index === 0 ? `1px solid ${theme.palette.border.darker}` : "",
          borderBottom: index === 0 ? `1px solid ${theme.palette.border.darker}` : "",
          position: "absolute",
          width: "100%",
          top: `${top}px`,
          height: `${height}px`,
        };

        if (isGap) {
          return (
            <StratigraphyViewTableCell
              key={`gap-${id}-${index}`}
              sx={{
                backgroundColor: theme.palette.error.background,
                ...viewCellStyles,
              }}>
              <StratigraphyTableCellRow color={theme.palette.error.main} mt={3} />
            </StratigraphyViewTableCell>
          );
        }

        return (
          <StratigraphyTableActionCell
            layer={layer}
            key={id}
            sx={{
              backgroundColor: getColor(layer as Lithology),
              ...viewCellStyles,
            }}>
            {renderLayer(layer)}
          </StratigraphyTableActionCell>
        );
      })}
    </StratigraphyTableColumn>
  );
};
