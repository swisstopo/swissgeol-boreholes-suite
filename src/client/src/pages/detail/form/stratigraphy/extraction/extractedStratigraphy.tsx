import { FC, useCallback } from "react";
import { Box, CircularProgress, Stack, Typography } from "@mui/material";
import { BoreholeAttachment } from "../../../../../api/apiInterfaces.ts";
import { useExtractStratigraphiesQuery } from "../../../../../api/file/file.ts";
import { BaseLayer, FaciesDescription, LithologicalDescription } from "../../../../../api/stratigraphy.ts";
import { FullPageCentered } from "../../../../../components/styledComponents.ts";
import { useScaleContext } from "../stratigraphyV2/lithologyV2/scaleContext.tsx";
import { StratigraphyViewTable } from "../stratigraphyV2/lithologyV2/stratigraphyViewTable.tsx";
import { useCompletedLayers } from "../stratigraphyV2/lithologyV2/useCompletedLayers.tsx";

interface ExtractedStratigraphyProps {
  file: BoreholeAttachment;
}

export const ExtractedStratigraphy: FC<ExtractedStratigraphyProps> = ({ file }) => {
  const { scaleY } = useScaleContext();
  const { data: lithologicalDescriptions = [], isLoading, isFetching, isError } = useExtractStratigraphiesQuery(file);
  const { completedLayers: completedLithologicalDescriptions } = useCompletedLayers(lithologicalDescriptions);

  function isFaciesOrLithologicalDescription(desc: BaseLayer): desc is FaciesDescription | LithologicalDescription {
    return "description" in desc;
  }

  const renderDescription = useCallback(
    (description: BaseLayer) => {
      if (!isFaciesOrLithologicalDescription(description)) return null;
      // Calculate the height of the enclosing div
      const pxPerMeter = 20;
      const height = (description.toDepth - description.fromDepth) * pxPerMeter * scaleY;
      if (height < 36) return null;
      return (
        <Stack sx={{ height: "100%" }} justifyContent="center">
          <Typography
            variant="body2"
            sx={{
              display: "-webkit-box",
              WebkitLineClamp: Math.max(1, Math.round((height - 8) / 25)),
              WebkitBoxOrient: "vertical",
              lineHeight: "1.8",
              transform: `scaleY(${1 / scaleY})`,
              transformOrigin: "center",
            }}>
            {description.description}
          </Typography>
        </Stack>
      );
    },
    [scaleY],
  );

  if (isError) {
    return <div>Error loading stratigraphy data.</div>;
  }

  if (isLoading) {
    return (
      <FullPageCentered sx={{ height: "100%" }}>
        <CircularProgress />
      </FullPageCentered>
    );
  }

  return (
    <>
      {isFetching && <Box>.. update in progress</Box>}
      <StratigraphyViewTable
        depthLayers={completedLithologicalDescriptions}
        columns={[
          {
            id: "lithoDescription",
            layers: completedLithologicalDescriptions,
            label: "lithological_description",
            renderLayer: renderDescription,
            onCopyAction: () => console.log("copy lithological description"),
          },
        ]}
      />
    </>
  );
};
