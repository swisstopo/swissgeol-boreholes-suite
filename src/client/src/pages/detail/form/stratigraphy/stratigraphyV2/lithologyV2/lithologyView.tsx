import { FC, useState } from "react";
import { useTranslation } from "react-i18next";
import { Box, Button, Stack, Typography } from "@mui/material";
import { ChevronDown, ChevronUp } from "lucide-react";
import { Language } from "@swissgeol/ui-core";
import i18n from "i18next";
import {
  FaciesDescription,
  LithologicalDescription,
  useFaciesDescription,
  useLithoDescription,
} from "../../../../../../api/stratigraphy.ts";
import { theme } from "../../../../../../AppTheme.ts";
import { formatNumberForDisplay } from "../../../../../../components/form/formUtils.ts";
import { Lithology } from "../../lithology.ts";
import { BaseLayer, BaseLayerColumn } from "./BaseLayerColumn.tsx";
import { ScaleContext } from "./scaleContext.tsx";
import { useCompletedLayers } from "./useCompletedLayers.tsx";
import { VerticalZoomPanWrapper } from "./VerticalZoomPanWrapper.tsx";

interface LithologyViewProps {
  lithologies: Lithology[];
  stratigraphyId: number;
}

export const LithologyView: FC<LithologyViewProps> = ({ lithologies, stratigraphyId }) => {
  const [translateY, setTranslateY] = useState(0);
  const [scaleY, setScaleY] = useState(1);
  const { t } = useTranslation();
  const { data: lithologicalDescriptions } = useLithoDescription(stratigraphyId - 15000000); // workaround until there is seed data for stratigraphyV2
  const { data: faciesDescriptions } = useFaciesDescription(stratigraphyId - 15000000);
  const { completedLayers: completedLithologies } = useCompletedLayers(lithologies);
  const { completedLayers: completedLithologicalDescriptions } = useCompletedLayers(lithologicalDescriptions);
  const { completedLayers: completedFaciesDescriptions } = useCompletedLayers(faciesDescriptions);

  const renderOverviewLayer = () => {
    return <></>;
  };

  const renderDescription = (description: BaseLayer) => {
    const desc = description as FaciesDescription | LithologicalDescription;
    return (
      <>
        <Typography
          variant="body2"
          sx={{
            py: 1 / scaleY,
            transform: `scaleY(${1 / scaleY})`,
            transformOrigin: "center",
          }}>
          {desc.description}
        </Typography>
      </>
    );
  };

  const renderLithology = (layer: BaseLayer) => {
    const lithology = layer as Lithology;
    return (
      <>
        <Typography
          variant="body2"
          sx={{
            transform: `scaleY(${1 / scaleY})`,
            transformOrigin: "center",
          }}>
          {lithology?.lithologyDescriptions?.[0].lithologyUnconMain?.[i18n.language as Language] ?? "-"}
        </Typography>
      </>
    );
  };

  const renderDepthColumnLayer = (lithology: BaseLayer) => {
    return (
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
          {formatNumberForDisplay(lithology.toDepth, 1, 1)}
        </Typography>
      </>
    );
  };

  return (
    <>
      {/*Header*/}
      <Stack direction={"row"} sx={{ position: "relative", width: "100%" }} spacing={1.5}>
        <Stack direction={"row"} spacing={1.5}>
          <Box sx={{ width: "45px" }}>
            <Button
              sx={{ height: "36px", mb: "6px" }}
              onClick={() =>
                setTranslateY(prev => {
                  const newValue = prev + 100 * scaleY;
                  return Math.min(newValue, 12);
                })
              }
              variant="outlined">
              <ChevronUp />
            </Button>
          </Box>
        </Stack>
        <Stack
          justifyContent="flex-start"
          direction="row"
          sx={{ height: theme.spacing(5), width: "100%", backgroundColor: theme.palette.background.listItemActive }}>
          {/*Todo: make depth column thinner while still displaying text in all languages*/}
          <Box sx={{ width: "180px", textAlign: "flex-start", px: 2, py: 1 }}>{`${t("depth")} ${t("mMd")}`}</Box>
          <Box sx={{ flex: "1 0 0", textAlign: "flex-start", px: 2, py: 1 }}>{t("lithology")}</Box>
          <Box sx={{ flex: "1 0 0", textAlign: "flex-start", px: 2, py: 1 }}> {t("lithological_description")}</Box>
          <Box sx={{ flex: "1 0 0", textAlign: "flex-start", px: 2, py: 1 }}>{t("facies_description")}</Box>
        </Stack>
      </Stack>
      <ScaleContext.Provider
        value={{
          scaleY,
          setScaleY,
          translateY,
          setTranslateY,
        }}>
        {/*Scrolling area*/}
        <VerticalZoomPanWrapper>
          {/*Todo: Fix height based on available space*/}
          <Stack justifyContent="flex-start" direction="row" sx={{ height: "500px", width: "100%" }}>
            <BaseLayerColumn
              layers={completedLithologies}
              sx={{ width: "45px", flexShrink: 0, mr: theme.spacing(1.5) }}
              colorAttribute={"lithologyCon"}
              isFirstColumn={true}
              renderLayer={renderOverviewLayer}
            />
            <BaseLayerColumn
              layers={completedLithologies}
              sx={{ width: "180px" }}
              isFirstColumn={true}
              renderLayer={renderDepthColumnLayer}
            />
            <BaseLayerColumn layers={completedLithologies} sx={{ flex: "1 0 0" }} renderLayer={renderLithology} />
            <BaseLayerColumn
              layers={completedLithologicalDescriptions}
              sx={{ flex: "1 0 0" }}
              renderLayer={renderDescription}
            />
            <BaseLayerColumn
              layers={completedFaciesDescriptions}
              sx={{ flex: "1 0 0" }}
              renderLayer={renderDescription}
            />
          </Stack>
        </VerticalZoomPanWrapper>
      </ScaleContext.Provider>
      {/*Footer*/}
      <Stack direction={"row"} spacing={1.5}>
        <Box sx={{ width: "45px" }}>
          <Button
            sx={{ height: "36px", mt: "6px" }}
            onClick={() => setTranslateY(prev => prev + 100 * scaleY)}
            variant="outlined">
            <ChevronDown />
          </Button>
        </Box>
        <Box sx={{ width: "45px" }}></Box>
      </Stack>
    </>
  );
};
