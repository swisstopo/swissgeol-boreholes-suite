import { FC, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { Box, Button, Stack, Typography } from "@mui/material";
import { ChevronDown, ChevronUp } from "lucide-react";
import { Language } from "@swissgeol/ui-core";
import i18n from "i18next";
import {
  BaseLayer,
  FaciesDescription,
  LithologicalDescription,
  useFaciesDescription,
  useLithoDescription,
} from "../../../../../../api/stratigraphy.ts";
import { formatNumberForDisplay } from "../../../../../../components/form/formUtils.ts";
import { Lithology } from "../../lithology.ts";
import {
  StratigraphyTableCellRow,
  StratigraphyTableContent,
  StratigraphyTableHeader,
  StratigraphyTableHeaderCell,
} from "../stratigraphyTableComponents.tsx";
import { BaseLayerColumn } from "./BaseLayerColumn.tsx";
import { useScaleContext } from "./scaleContext.tsx";
import { useCompletedLayers } from "./useCompletedLayers.tsx";
import { VerticalZoomPanWrapper } from "./VerticalZoomPanWrapper.tsx";

const pxPerMeter = 20;
const defaultCellHeight = 36;
/*Todo: Set table height based on available space*/
const tableHeight = 500;
const scrollStep = 100;
const minTranslateY = 12;
const overviewColumnWidth = 45;

function isFaciesOrLithologicalDescription(desc: BaseLayer): desc is FaciesDescription | LithologicalDescription {
  return "description" in desc;
}

interface LithologyViewProps {
  lithologies: BaseLayer[];
  stratigraphyId: number;
}

export const LithologyView: FC<LithologyViewProps> = ({ lithologies, stratigraphyId }) => {
  const { t } = useTranslation();
  const { data: lithologicalDescriptions } = useLithoDescription(stratigraphyId - 15000000); // workaround until there is seed data for stratigraphyV2
  const { data: faciesDescriptions } = useFaciesDescription(stratigraphyId);
  const { completedLayers: completedLithologies } = useCompletedLayers(lithologies);
  const { completedLayers: completedLithologicalDescriptions } = useCompletedLayers(
    (lithologicalDescriptions ?? []) as BaseLayer[],
  );
  const { completedLayers: completedFaciesDescriptions } = useCompletedLayers(
    (faciesDescriptions ?? []) as BaseLayer[],
  );
  const { scaleY, setTranslateY } = useScaleContext();

  const getMaxLinesToDisplay = useCallback(
    (desc: BaseLayer): number => {
      const actualHeight: number = (desc.toDepth - desc.fromDepth) * pxPerMeter * scaleY;
      // substract 4 lines for hover area
      return Math.max(Math.round(actualHeight / 25) - 4, 1);
    },
    [scaleY],
  );

  const renderDescription = useCallback(
    (description: BaseLayer) => {
      if (!isFaciesOrLithologicalDescription(description)) return null;
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

  const renderDepthColumnLayer = useCallback(
    (lithology: BaseLayer) => (
      <>
        <StratigraphyTableCellRow height={`${defaultCellHeight / scaleY}px`}>
          <Typography
            variant="body1"
            sx={{
              transform: `scaleY(${1 / scaleY})`,
              transformOrigin: "center",
            }}>
            {formatNumberForDisplay(lithology.fromDepth, 1, 1)}
          </Typography>
        </StratigraphyTableCellRow>
        <StratigraphyTableCellRow sx={{ flex: 1 }} />
        <StratigraphyTableCellRow height={`${defaultCellHeight / scaleY}px`}>
          <Typography
            variant="body1"
            sx={{
              transform: `scaleY(${1 / scaleY})`,
              transformOrigin: "center",
            }}>
            {formatNumberForDisplay(lithology.toDepth, 1, 1)}
          </Typography>
        </StratigraphyTableCellRow>
      </>
    ),
    [scaleY],
  );

  return (
    <Stack direction="row" justifyContent="flex-start" spacing={1.5}>
      {/* Overview column */}
      <Stack direction="column" sx={{ position: "relative", width: "45px", height: "100%" }}>
        {/*Todo: use resize observer and ref to match Box height with actual table header, even if titles takes up 2 lines.*/}
        <Box>
          <Button
            sx={{ height: `${defaultCellHeight}px`, mb: "2px" }}
            onClick={() => setTranslateY((prev: number) => Math.min(prev + scrollStep * scaleY, minTranslateY))}
            variant="outlined"
            aria-label={t("scroll_up")}>
            <ChevronUp />
          </Button>
        </Box>
        <VerticalZoomPanWrapper>
          <Stack sx={{ height: `${tableHeight}px` }}>
            <BaseLayerColumn
              layers={completedLithologies}
              renderLayer={() => null}
              sx={{ flex: `0 0  ${overviewColumnWidth}px` }}
              colorAttribute="lithologyCon"
            />
          </Stack>
        </VerticalZoomPanWrapper>
        <Box sx={{ width: `${overviewColumnWidth}px` }}>
          <Button
            sx={{ height: `${defaultCellHeight}px`, mt: "2px" }}
            onClick={() => setTranslateY((prev: number) => prev + scrollStep * scaleY)}
            variant="outlined"
            aria-label={t("scroll_down")}>
            <ChevronDown />
          </Button>
        </Box>
        <Box sx={{ width: `${overviewColumnWidth}px` }} />
      </Stack>
      {/* Table */}
      {/*Padding accounts for scroll button*/}
      <Stack sx={{ flex: 1, pb: "38px" }}>
        <StratigraphyTableHeader>
          <StratigraphyTableHeaderCell sx={{ flex: "0 0 90px" }} label={t("depth")} />
          <StratigraphyTableHeaderCell label={t("lithology")} />
          <StratigraphyTableHeaderCell label={t("lithological_description")} />
          <StratigraphyTableHeaderCell label={t("facies_description")} />
        </StratigraphyTableHeader>
        <VerticalZoomPanWrapper>
          <StratigraphyTableContent sx={{ height: `${tableHeight}px` }}>
            <BaseLayerColumn
              layers={completedLithologies}
              sx={{ flex: "0 0 90px" }}
              renderLayer={renderDepthColumnLayer}
            />
            <BaseLayerColumn
              layers={completedLithologies}
              renderLayer={renderLithology}
              onCopyAction={() => console.log("copy lithology")}
            />
            <BaseLayerColumn
              layers={completedLithologicalDescriptions}
              renderLayer={renderDescription}
              onCopyAction={() => console.log("copy lithological description")}
            />
            <BaseLayerColumn
              layers={completedFaciesDescriptions}
              renderLayer={renderDescription}
              onCopyAction={() => console.log("copy facies description")}
            />
          </StratigraphyTableContent>
        </VerticalZoomPanWrapper>
      </Stack>
    </Stack>
  );
};
