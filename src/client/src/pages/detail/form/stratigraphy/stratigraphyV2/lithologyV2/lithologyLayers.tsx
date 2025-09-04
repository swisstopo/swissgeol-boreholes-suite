import { FC } from "react";
import { useTranslation } from "react-i18next";
import { Box, Chip, Stack, SxProps, Typography } from "@mui/material";
import { TriangleAlert } from "lucide-react";
import { theme } from "../../../../../../AppTheme.ts";
import { formatNumberForDisplay } from "../../../../../../components/form/formUtils.ts";
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
  const { scaleY } = useScaleContext();
  const { t } = useTranslation();
  const pxPerMeter = 20;

  return (
    <Box sx={{ position: "relative", height: "100%", width: "100%", ...sx, borderRight: "1px solid grey" }}>
      {lithologies?.map(lithology => {
        const colorArray =
          (colorAttribute &&
            JSON.parse(lithology?.lithologyDescriptions?.find(desc => desc.isFirst)?.[colorAttribute]?.conf ?? null)
              ?.color) ||
          null;
        const color = colorArray
          ? `rgb(${colorArray[0]}, ${colorArray[1]}, ${colorArray[2]})`
          : theme.palette.background.lightgrey;
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
              // Todo: account for scale in borderWidth
              borderBottom: "1px solid grey",
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
                  {formatNumberForDisplay(lithology.fromDepth, 1, 1)}
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    transform: `scaleY(${1 / scaleY})`,
                    transformOrigin: "center",
                  }}>
                  {"placeholder Text"}
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    transform: `scaleY(${1 / scaleY})`,
                    transformOrigin: "center",
                  }}>
                  {formatNumberForDisplay(lithology.toDepth, 1, 1)}
                </Typography>
              </>
            )}
            {lithology?.isGap && displayText && (
              // Todo: use common layer gap component
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
