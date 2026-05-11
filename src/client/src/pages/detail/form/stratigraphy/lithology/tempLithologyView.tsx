import { FC, ReactNode, useCallback, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Stack, Typography } from "@mui/material";
import { BaseLayer } from "../../../../../api/stratigraphy.ts";
import { formatNumberForDisplay } from "../../../../../components/form/formUtils.ts";
import { FaciesDescription } from "../faciesDescription.ts";
import { LithologicalDescription } from "../lithologicalDescription.ts";
import { Lithology } from "../lithology.ts";
import {
  StratigraphyTableActionCell,
  StratigraphyTableCell,
  StratigraphyTableColumn,
  StratigraphyTableContent,
  StratigraphyTableDescriptionGap,
  StratigraphyTableGap,
  StratigraphyTableHeader,
  StratigraphyTableHeaderCell,
} from "../stratigraphyTableComponents.tsx";
import { getLayersWithGaps } from "../stratigraphyUtils.ts";
import { FaciesDescriptionLabels } from "./faciesDescriptionLabels.tsx";
import { LithologyLabels } from "./lithologyLabels.tsx";
import { useCompletedLayers } from "./useCompletedLayers.tsx";
import { useLayerDepths } from "./useLayerDepths.tsx";

interface LithologyContentEditProps {
  lithologies: Lithology[];
  lithologicalDescriptions: LithologicalDescription[];
  faciesDescriptions: FaciesDescription[];
}

// Temporary Lithology View component (read-only, non-editable) to display lithology before panable/zoomable version is fully implemented.
export const TempLithologyView: FC<LithologyContentEditProps> = ({
  lithologies,
  lithologicalDescriptions,
  faciesDescriptions,
}) => {
  const { t } = useTranslation();

  const { depths } = useLayerDepths(lithologies);

  const { completedLayers: completedLithologies } = useCompletedLayers(lithologies, depths);
  const stratigraphyId = lithologies[0]?.stratigraphyId ?? 0;
  const completedLithologicalDescriptions = useMemo(
    () =>
      getLayersWithGaps(
        lithologicalDescriptions.map(layer => ({ item: layer, hasChanges: false })),
        depths,
        stratigraphyId,
      ).map(l => l.item),
    [lithologicalDescriptions, depths, stratigraphyId],
  );
  const completedFaciesDescriptions = useMemo(
    () =>
      getLayersWithGaps(
        faciesDescriptions.map(layer => ({ item: layer, hasChanges: false })),
        depths,
        stratigraphyId,
      ).map(l => l.item),
    [faciesDescriptions, depths, stratigraphyId],
  );

  const defaultRowHeight = 240;

  const computeCellHeight = useCallback(
    (fromDepth: number, toDepth: number) => {
      const startIndex = depths.findIndex(l => l.fromDepth === fromDepth);
      const endIndex = depths.findIndex(l => l.toDepth === toDepth);
      if (startIndex === -1 || endIndex === -1) return defaultRowHeight;
      return (endIndex - startIndex + 1) * defaultRowHeight;
    },
    [depths],
  );

  const renderGapCell = (
    index: number,
    layer: BaseLayer,
    keyPrefix: string,
    defaultRowHeight: number,
    computeCellHeight: ((fromDepth: number, toDepth: number) => number) | null,
    GapComponent: typeof StratigraphyTableGap,
  ) => (
    <GapComponent
      key={`${keyPrefix}-${layer.fromDepth}-${layer.id}`}
      dataCy={`${keyPrefix}-${layer.fromDepth}-${layer.id}`}
      sx={{
        height: `${computeCellHeight ? computeCellHeight(layer.fromDepth, layer.toDepth) : defaultRowHeight}px`,
      }}
      index={index}
    />
  );

  const renderActionCell = (
    index: number,
    layer: BaseLayer,
    keyPrefix: string,
    defaultRowHeight: number,
    computeCellHeight: ((fromDepth: number, toDepth: number) => number) | null,
    buildContent: (layer: BaseLayer) => ReactNode,
  ) => (
    <StratigraphyTableActionCell
      key={`${keyPrefix}-${layer.id}`}
      dataCy={`${keyPrefix}-${index}`}
      sx={{
        height: `${computeCellHeight ? computeCellHeight(layer.fromDepth, layer.toDepth) : defaultRowHeight}px`,
      }}
      index={index}
      layer={layer}>
      {buildContent(layer)}
    </StratigraphyTableActionCell>
  );

  const renderTableCells = (
    layers: BaseLayer[],
    defaultRowHeight: number,
    computeCellHeight: ((fromDepth: number, toDepth: number) => number) | null,
    buildContent: (layer: BaseLayer) => ReactNode,
    keyPrefix: string,
    GapComponent: typeof StratigraphyTableGap,
  ) => {
    if (!layers || layers.length === 0) {
      return (
        <GapComponent
          key={`${keyPrefix}-new`}
          dataCy={`${keyPrefix}-new`}
          sx={{ height: `${defaultRowHeight}px` }}
          index={-1}
        />
      );
    }

    return layers.map((layer, index) =>
      layer.isGap
        ? renderGapCell(index, layer, keyPrefix, defaultRowHeight, computeCellHeight, GapComponent)
        : renderActionCell(index, layer, keyPrefix, defaultRowHeight, computeCellHeight, buildContent),
    );
  };

  return (
    <Stack gap={1.5}>
      <Stack>
        <StratigraphyTableHeader>
          <StratigraphyTableHeaderCell sx={{ flex: "0 0 90px" }} label={t("depth")} />
          <StratigraphyTableHeaderCell label={t("lithology")} />
          <StratigraphyTableHeaderCell label={t("lithological_description")} />
          <StratigraphyTableHeaderCell label={t("facies_description")} />
        </StratigraphyTableHeader>
        <StratigraphyTableContent>
          <StratigraphyTableColumn sx={{ flex: "0 0 90px" }}>
            {!depths || depths.length === 0 ? (
              <StratigraphyTableCell>empty</StratigraphyTableCell>
            ) : (
              depths.map(depth => (
                <StratigraphyTableCell
                  data-cy={`depth-${depth.fromDepth}-${depth.toDepth}`}
                  key={`${depth.lithologyId}-depth-${depth.fromDepth}-${depth.toDepth}`}
                  sx={{ height: `${defaultRowHeight}px` }}>
                  <Typography>{`${formatNumberForDisplay(depth.fromDepth)} m MD`}</Typography>
                  <Typography>{`${formatNumberForDisplay(depth.toDepth)} m MD`}</Typography>
                </StratigraphyTableCell>
              ))
            )}
          </StratigraphyTableColumn>
          <StratigraphyTableColumn>
            {renderTableCells(
              completedLithologies,
              defaultRowHeight,
              computeCellHeight,
              layer => (
                <LithologyLabels lithology={layer as Lithology} />
              ),
              "lithology",
              StratigraphyTableGap,
            )}
          </StratigraphyTableColumn>
          <StratigraphyTableColumn>
            {renderTableCells(
              completedLithologicalDescriptions,
              defaultRowHeight,
              computeCellHeight,
              layer => (
                <Typography variant="body1" fontWeight={700}>
                  {(layer as LithologicalDescription).description}
                </Typography>
              ),
              "lithologicalDescription",
              StratigraphyTableDescriptionGap,
            )}
          </StratigraphyTableColumn>
          <StratigraphyTableColumn>
            {renderTableCells(
              completedFaciesDescriptions,
              defaultRowHeight,
              computeCellHeight,
              layer => (
                <FaciesDescriptionLabels description={layer as FaciesDescription} />
              ),
              "faciesDescription",
              StratigraphyTableDescriptionGap,
            )}
          </StratigraphyTableColumn>
        </StratigraphyTableContent>
      </Stack>
    </Stack>
  );
};
