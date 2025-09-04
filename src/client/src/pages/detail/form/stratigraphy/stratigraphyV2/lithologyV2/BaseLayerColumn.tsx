import { FC, ReactNode } from "react";
import { Box, Stack, SxProps } from "@mui/material";
import { TriangleAlert } from "lucide-react";
import { Stratigraphy } from "../../../../../../api/stratigraphy.ts";
import { theme } from "../../../../../../AppTheme.ts";
import { Codelist } from "../../../../../../components/codelist.ts";
import { Lithology, LithologyDescription } from "../../lithology.ts";
import { useScaleContext } from "./scaleContext.tsx";

export interface BaseLayer {
  id: number;
  fromDepth: number;
  toDepth: number;
  stratigraphyId: number;
  stratigraphy: Stratigraphy;
  isGap?: boolean;
}

interface BaseLayerColumnProps {
  layers: BaseLayer[];
  renderLayer: (layer: BaseLayer) => ReactNode;
  sx?: SxProps;
  colorAttribute?: keyof LithologyDescription | null;
  isFirstColumn?: boolean;
}

export const BaseLayerColumn: FC<BaseLayerColumnProps> = ({
  layers = [],
  renderLayer,
  sx,
  colorAttribute = null,
  isFirstColumn = false,
}) => {
  const { scaleY } = useScaleContext();
  const pxPerMeter = 20;

  function getColor(lithology: Lithology) {
    if (colorAttribute) {
      const colorCodelist: Codelist = lithology?.lithologyDescriptions?.find(
        (desc: LithologyDescription) => desc.isFirst,
      )?.[colorAttribute] as Codelist;
      const colorArray = (colorAttribute && JSON.parse(colorCodelist?.conf ?? null)?.color) || null;
      return colorArray
        ? `rgb(${colorArray[0]}, ${colorArray[1]}, ${colorArray[2]})`
        : theme.palette.background.lightgrey;
    } else return theme.palette.background.lightgrey;
  }

  return (
    <Box sx={{ position: "relative", height: "100%", width: "100%", ...sx }}>
      {layers?.map((layer: BaseLayer, index: number) => {
        const top = layer.fromDepth * pxPerMeter;
        const height = (layer.toDepth - layer.fromDepth) * pxPerMeter;
        const isTooThinForText = height * scaleY < 50;
        return (
          <Stack
            key={layer.id}
            direction="column"
            px={2}
            py={1 / scaleY}
            sx={{
              backgroundColor: layer?.isGap ? "#FFEDEE" : getColor(layer as Lithology),
              borderRight: "1px solid grey",
              borderLeft: isFirstColumn ? "1px solid grey" : "",
              borderBottom: index == 0 ? "1px solid grey" : "",
              borderTop: "1px solid grey",
              // Todo: account for scale in borderWidth
              position: "absolute",
              top: `${top}px`,
              height: `${height}px`,
              width: "100%",
              justifyContent: "space-between",
            }}>
            {!layer?.isGap && !isTooThinForText && renderLayer(layer)}
            {layer?.isGap && (
              // Todo: use common layer gap component
              <Stack direction={"row"} spacing={1} justifyContent={"center"} sx={{ pt: 2 / scaleY }}>
                <Box sx={{ transform: `scaleY(${1 / scaleY})` }}>
                  <TriangleAlert color={theme.palette.error.main} />
                </Box>
              </Stack>
            )}
          </Stack>
        );
      })}
    </Box>
  );
};
