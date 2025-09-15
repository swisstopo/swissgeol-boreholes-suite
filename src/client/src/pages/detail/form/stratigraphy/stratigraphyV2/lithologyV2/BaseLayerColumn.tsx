import { FC, ReactNode, useMemo } from "react";
import { SxProps } from "@mui/material";
import { BaseLayer } from "../../../../../../api/stratigraphy.ts";
import { theme } from "../../../../../../AppTheme.ts";
import { Codelist } from "../../../../../../components/codelist.ts";
import { Lithology, LithologyDescription } from "../../lithology.ts";
import {
  StratigraphyTableActionCell,
  StratigraphyTableCellRow,
  StratigraphyTableColumn,
  StratigraphyTableGap,
  StratigraphyViewTableCell,
} from "../stratigraphyTableComponents.tsx";
import { useScaleContext } from "./scaleContext.tsx";

interface BaseLayerColumnProps {
  layers: BaseLayer[];
  renderLayer: (layer: BaseLayer) => ReactNode;
  sx?: SxProps;
  onCopyAction?: () => void;
  colorAttribute?: keyof LithologyDescription | null;
  isFirstColumn?: boolean;
}

const pxPerMeter = 20;
const defaultRowHeight = 500;

const getColor = (lithology: Lithology, colorAttribute: keyof LithologyDescription | null) => {
  if (colorAttribute) {
    const colorCodelist: Codelist = lithology?.lithologyDescriptions?.find(
      (desc: LithologyDescription) => desc.isFirst,
    )?.[colorAttribute] as Codelist;
    const colorArray = (colorAttribute && JSON.parse(colorCodelist?.conf ?? null)?.color) || null;
    return colorArray
      ? `rgb(${colorArray[0]}, ${colorArray[1]}, ${colorArray[2]})`
      : theme.palette.background.lightgrey;
  }
  return theme.palette.background.lightgrey;
};

export const BaseLayerColumn: FC<BaseLayerColumnProps> = ({
  layers,
  renderLayer,
  sx,
  onCopyAction,
  colorAttribute = null,
  isFirstColumn = false,
}) => {
  const { scaleY } = useScaleContext();

  const stratigraphyId = useMemo(() => (layers.length > 0 ? layers[0].stratigraphyId : 0), [layers]);

  if (!layers || layers.length === 0) {
    return (
      <StratigraphyTableColumn sx={{ position: "relative", height: "100%", ...sx }}>
        <StratigraphyTableGap
          key="none"
          scaleY={scaleY}
          sx={{ height: `${defaultRowHeight}px` }}
          layer={{ id: 0, stratigraphyId, isGap: true, fromDepth: -1, toDepth: -1 }}
        />
      </StratigraphyTableColumn>
    );
  }

  return (
    <StratigraphyTableColumn sx={{ position: "relative", height: "100%", ...sx }}>
      {layers.map((layer: BaseLayer, index: number) => {
        const { id, fromDepth, toDepth, isGap } = layer;
        const top = fromDepth * pxPerMeter;
        const height = (toDepth - fromDepth) * pxPerMeter;
        const hasSpaceForText = height * scaleY > 60;
        // Todo: Account for scale in border width
        // Todo: Fix bug where border length does not scale
        const viewCellStyles = {
          borderLeft: isFirstColumn ? `1px solid ${theme.palette.border.darker}` : "",
          position: "absolute",
          width: "100%",
          borderBottom: index === 0 ? `1px solid ${theme.palette.border.darker}` : "",
          top: `${top}px`,
          height: `${height}px`,
        };

        if (isGap) {
          if (isFirstColumn)
            return (
              <StratigraphyViewTableCell
                key={`gap-${id}-${index}`}
                sx={{
                  backgroundColor: theme.palette.error.background,
                  ...viewCellStyles,
                }}>
                <StratigraphyTableCellRow color={theme.palette.error.main} mt={3 / scaleY} />
              </StratigraphyViewTableCell>
            );

          return (
            <StratigraphyTableGap
              key={`gap-${id}-${index}`}
              scaleY={scaleY}
              layer={layer}
              sx={{
                backgroundColor: theme.palette.error.background,
                ...viewCellStyles,
              }}
            />
          );
        }

        return (
          <StratigraphyTableActionCell
            layer={layer}
            key={id}
            scaleY={scaleY}
            onHoverClick={onCopyAction}
            sx={{
              backgroundColor: getColor(layer as Lithology, colorAttribute),
              ...viewCellStyles,
            }}>
            {hasSpaceForText && renderLayer(layer)}
          </StratigraphyTableActionCell>
        );
      })}
    </StratigraphyTableColumn>
  );
};
