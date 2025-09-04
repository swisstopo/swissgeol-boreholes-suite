import { FC } from "react";
import { useTranslation } from "react-i18next";
import { Box, Chip, Stack, SxProps, Typography } from "@mui/material";
import { TriangleAlert } from "lucide-react";
import { theme } from "../../../../../../AppTheme.ts";
import { formatNumberForDisplay } from "../../../../../../components/form/formUtils.ts";
import { Lithology } from "../../lithology.ts";
import { useScaleContext } from "./scaleContext.tsx";

interface LithologyLayersProps {
  lithologies: Lithology[];
  sx?: SxProps;
  displayText?: boolean;
  colorAttribute?: string;
}

export const LithologyLayers: FC<LithologyLayersProps> = ({
  lithologies = [],
  sx,
  colorAttribute,
  displayText = true,
}) => {
  const { scaleY, translateY } = useScaleContext();
  const { t } = useTranslation();
  const pxPerMeter = 20;
  // Sort lithologies by fromDepth to process them in order
  const sortedLithologies = [...lithologies].sort((a, b) => a.fromDepth - b.fromDepth);

  // Array to hold all layers including gap fillers
  const allLayers: (Lithology | { id: string; fromDepth: number; toDepth: number; isGap: boolean })[] = [];

  // Process lithologies and add gap fillers
  let lastDepth = 0;
  sortedLithologies?.forEach((lithology, index) => {
    // If there's a gap between this layer and the previous depth, add a gap filler
    if (lithology.fromDepth > lastDepth && index > 0) {
      allLayers.push({
        id: `gap-${index}`,
        fromDepth: lastDepth,
        toDepth: lithology.fromDepth,
        isGap: true,
      });
    }

    // Add the actual lithology layer
    allLayers.push(lithology);

    // Update the lastDepth
    lastDepth = lithology.toDepth;
  });
  return (
    <Box sx={{ position: "relative", height: "100%", width: "100%", ...sx }}>
      {allLayers?.map((lithology: Lithology) => {
        const colorArray =
          (colorAttribute &&
            JSON.parse(lithology.lithologyDescriptions?.find(desc => desc.isFirst)?.[colorAttribute]?.conf ?? null)
              ?.color) ||
          null;
        const color = colorArray ? `rgb(${colorArray[0]}, ${colorArray[1]}, ${colorArray[2]})` : "pink";
        const top = lithology.fromDepth * pxPerMeter;
        const height = (lithology.toDepth - lithology.fromDepth) * pxPerMeter;
        const isTooThinForText = height * scaleY < 50;
        return (
          <Stack
            key={lithology.id}
            direction="column"
            px={2}
            py={1 / scaleY}
            sx={{
              backgroundColor: lithology?.isGap ? "#FFEDEE" : color,
              borderBottom: "1px solid black",
              position: "absolute",
              top: `${top}px`,
              height: `${height}px`,
              width: "100%",
              justifyContent: "space-between",
            }}>
            {!lithology?.isGap && displayText && !isTooThinForText && (
              <>
                <Typography
                  variant="body2"
                  sx={{
                    transform: `scaleY(${1 / scaleY})`,
                    transformOrigin: "center",
                  }}>
                  {formatNumberForDisplay(lithology.fromDepth)} {t("mMd")}
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    transform: `scaleY(${1 / scaleY})`,
                    transformOrigin: "center",
                  }}>
                  {formatNumberForDisplay(lithology.toDepth)} {t("mMd")}
                </Typography>
              </>
            )}
            {lithology?.isGap && displayText && (
              <Stack direction={"row"} spacing={1} justifyContent={"space-around"} sx={{ pt: 2 / scaleY }}>
                <Box sx={{ transform: `scaleY(${1 / scaleY})` }}>
                  <Chip data-cy="gap-chip" color="error" label={t("gap")} />
                </Box>
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
