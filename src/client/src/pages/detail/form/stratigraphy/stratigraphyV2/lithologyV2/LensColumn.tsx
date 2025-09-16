import { FC, ReactNode, useRef, useState } from "react";
import Draggable from "react-draggable";
import { Box, SxProps } from "@mui/material";
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
import { useScaleContext } from "./scaleContext.tsx";

interface LensColumnProps {
  layers: BaseLayer[];
  renderLayer: (layer: BaseLayer) => ReactNode;
  colorAttribute: keyof LithologyDescription;
  sx?: SxProps;
}

export const LensColumn: FC<LensColumnProps> = ({ layers, renderLayer, colorAttribute, sx }) => {
  const [cursor, setCursor] = useState<"grab" | "grabbing">("grab");
  const { visibleStart, visibleEnd, maxDepth, tableHeight, translateY } = useScaleContext();
  const depthPxPerMeter = tableHeight / maxDepth;
  const lensRef = useRef(null);

  const getColor = (lithology: Lithology) => {
    const colorCodelist: Codelist = lithology?.lithologyDescriptions?.find(
      (desc: LithologyDescription) => desc.isFirst,
    )?.[colorAttribute] as Codelist;
    const colorArray = (colorAttribute && JSON.parse(colorCodelist?.conf ?? null)?.color) || null;
    return colorArray
      ? `rgb(${colorArray[0]}, ${colorArray[1]}, ${colorArray[2]})`
      : theme.palette.background.lightgrey;
  };

  const visibleHeight = (visibleEnd - visibleStart) * depthPxPerMeter;
  const lensStart = visibleStart * depthPxPerMeter;
  const lensHeight = Math.min(visibleHeight, tableHeight, tableHeight - lensStart);

  const handleDrag = (e, data) => {
    const newValue = data.y / depthPxPerMeter;

    console.log(data.y, newValue);
    console.log(translateY);

    // if (!isNaN(newValue) && newValue !== lensStart) {
    //   const ty = -newValue * pxPerMeter * scaleY * maxDepth;
    //   setTranslateY(prev => prev + ty);
    // }
  };

  return (
    <>
      <StratigraphyTableColumn sx={{ position: "relative", height: "100%", ...sx }}>
        {layers.map((layer: BaseLayer, index: number) => {
          const { id, fromDepth, toDepth, isGap } = layer;
          const top = fromDepth * depthPxPerMeter;
          const height = (toDepth - fromDepth) * depthPxPerMeter;
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

      <Draggable
        axis="y"
        bounds="parent"
        nodeRef={lensRef}
        position={{
          y: lensStart,
          x: 0,
        }}
        onDrag={handleDrag}
        onStart={() => setCursor("grabbing")}
        onStop={() => setCursor("grab")}>
        <Box
          ref={lensRef}
          sx={{
            mt: "38px", // offset for scroll button
            cursor: cursor,
            height: lensHeight + "px",
            position: "absolute",
            left: 0,
            right: 0,
            top: 0,
            bottom: 0,
            borderStyle: "solid",
            borderWidth: "2px",
            borderColor: "red",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
          }}
        />
      </Draggable>
    </>
  );
};
