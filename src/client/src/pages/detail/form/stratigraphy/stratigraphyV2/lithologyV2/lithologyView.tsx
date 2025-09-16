import { FC, useCallback, useEffect } from "react";
import { Box, Typography } from "@mui/material";
import { Language } from "@swissgeol/ui-core";
import i18n from "i18next";
import {
  BaseLayer,
  FaciesDescription,
  LithologicalDescription,
  useFaciesDescription,
  useLithoDescription,
} from "../../../../../../api/stratigraphy.ts";
import { Lithology } from "../../lithology.ts";
import { useScaleContext } from "./scaleContext.tsx";
import { StratigraphyViewTable } from "./stratigraphyViewTable.tsx";
import { useCompletedLayers } from "./useCompletedLayers.tsx";

function isFaciesOrLithologicalDescription(desc: BaseLayer): desc is FaciesDescription | LithologicalDescription {
  return "description" in desc;
}

interface LithologyViewProps {
  lithologies: BaseLayer[];
  stratigraphyId: number;
}

export const LithologyView: FC<LithologyViewProps> = ({ lithologies, stratigraphyId }) => {
  const { data: lithologicalDescriptions } = useLithoDescription(stratigraphyId - 15000000); // workaround until there is seed data for stratigraphyV2
  const { data: faciesDescriptions } = useFaciesDescription(stratigraphyId - 15000000); // workaround until there is seed data for stratigraphyV2
  const { completedLayers: completedLithologies } = useCompletedLayers(lithologies);
  const { completedLayers: completedLithologicalDescriptions } = useCompletedLayers(
    (lithologicalDescriptions ?? []) as BaseLayer[],
  );
  const { completedLayers: completedFaciesDescriptions } = useCompletedLayers(
    (faciesDescriptions ?? []) as BaseLayer[],
  );
  const { scaleY, setTableHeight, setMaxDepth } = useScaleContext();

  const getMaxLinesToDisplay = useCallback(
    (desc: BaseLayer): number => {
      const pxPerMeter = 20;
      const actualHeight: number = (desc.toDepth - desc.fromDepth) * pxPerMeter * scaleY;
      // subtract 4 lines for hover area
      return Math.max(Math.round(actualHeight / 25) - 4, 1);
    },
    [scaleY],
  );

  const renderDescription = useCallback(
    (description: BaseLayer) => {
      if (!isFaciesOrLithologicalDescription(description)) return null;
      // Calculate the height of the enclosing div
      const pxPerMeter = 20;
      const height = (description.toDepth - description.fromDepth) * pxPerMeter * scaleY;
      if (height < 36) return null;
      return (
        <Box sx={{ py: 1 / scaleY }}>
          <Typography
            variant="body2"
            sx={{
              overflow: "hidden",
              display: "-webkit-box",
              WebkitLineClamp: getMaxLinesToDisplay(description),
              WebkitBoxOrient: "vertical",
              transform: `scaleY(${1 / scaleY})`,
              transformOrigin: "center",
            }}>
            {description.description}
          </Typography>
        </Box>
      );
    },
    [getMaxLinesToDisplay, scaleY],
  );

  const renderLithology = useCallback(
    (layer: BaseLayer) => {
      const lithology = layer as Lithology;
      return (
        <Typography
          variant="body2"
          sx={{
            overflow: "hidden",
            display: "-webkit-box",
            WebkitLineClamp: getMaxLinesToDisplay(layer),
            WebkitBoxOrient: "vertical",
            transform: `scaleY(${1 / scaleY})`,
            transformOrigin: "center",
          }}>
          {lithology?.lithologyDescriptions?.[0]?.lithologyUnconMain?.[i18n.language as Language] ?? "-"}
        </Typography>
      );
    },
    [getMaxLinesToDisplay, scaleY],
  );

  useEffect(() => {
    /*Todo: Set table height based on available space*/
    setTableHeight(600);
    setMaxDepth(completedLithologies.length > 0 ? Math.max(...completedLithologies.map(l => l.toDepth || 0)) : 0);
  }, [completedLithologies, setMaxDepth, setTableHeight]);

  return (
    <StratigraphyViewTable
      depthLayers={completedLithologies}
      columns={[
        {
          id: "lithology",
          layers: completedLithologies,
          label: "lithology",
          renderLayer: renderLithology,
          onCopyAction: () => console.log("copy lithology"),
        },
        {
          id: "lithoDescription",
          layers: completedLithologicalDescriptions,
          label: "lithological_description",
          renderLayer: renderDescription,
          onCopyAction: () => console.log("copy lithological description"),
        },
        {
          id: "faciesDescription",
          layers: completedFaciesDescriptions,
          label: "facies_description",
          renderLayer: renderDescription,
          onCopyAction: () => console.log("copy facies description"),
        },
      ]}
    />
  );
};
