import { FC, ReactNode, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Stack, Typography } from "@mui/material";
import { formatNumberForDisplay } from "../../../../../components/form/formUtils.ts";
import { StratigraphyTableActionCell } from "../components/stratigraphyTableActionCell.tsx";
import { StratigraphyTableDescriptionGap } from "../components/stratigraphyTableDescriptionGap.tsx";
import { StratigraphyTableGap } from "../components/stratigraphyTableGap.tsx";
import { StratigraphyTableHeaderCell } from "../components/stratigraphyTableHeaderCell.tsx";
import {
  defaultRowHeight,
  StratigraphyTableCell,
  StratigraphyTableColumn,
  StratigraphyTableContent,
  StratigraphyTableHeader,
} from "../components/stratigraphyTablePrimitives.tsx";
import { BaseLayer, FaciesDescription, LithologicalDescription, Lithology } from "../stratigraphy.ts";
import { computeCellHeight, getLayersWithGaps } from "../stratigraphyUtils.ts";
import { FaciesDescriptionLabels } from "./faciesDescriptionLabels.tsx";
import { LithologyLabels } from "./lithologyLabels.tsx";
import { useCompletedLayers } from "./useCompletedLayers.tsx";
import { useLayerDepths } from "./useLayerDepths.tsx";

interface TempLithologyViewProps {
  lithologies: Lithology[];
  lithologicalDescriptions: LithologicalDescription[];
  faciesDescriptions: FaciesDescription[];
}

// Temporary Lithology View component (read-only, non-editable) to display lithology before panable/zoomable version is fully implemented.
export const TempLithologyView: FC<TempLithologyViewProps> = ({
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

  const renderGapCell = (
    index: number,
    layer: BaseLayer,
    keyPrefix: string,
    GapComponent: typeof StratigraphyTableGap,
  ) => (
    <GapComponent
      key={`${keyPrefix}-${layer.fromDepth}-${layer.id}`}
      dataCy={`${keyPrefix}-${layer.fromDepth}-${layer.id}`}
      sx={{
        height: `${computeCellHeight(layer.fromDepth ?? 0, layer.toDepth ?? 0, depths)}px`,
      }}
      index={index}
    />
  );

  const renderActionCell = (
    index: number,
    layer: BaseLayer,
    keyPrefix: string,
    buildContent: (layer: BaseLayer) => ReactNode,
  ) => (
    <StratigraphyTableActionCell
      key={`${keyPrefix}-${layer.id}`}
      dataCy={`${keyPrefix}-${layer.fromDepth}-${layer.toDepth}`}
      sx={{
        height: `${computeCellHeight(layer.fromDepth ?? 0, layer.toDepth ?? 0, depths)}px`,
      }}
      index={index}>
      {buildContent(layer)}
    </StratigraphyTableActionCell>
  );

  const renderTableCells = (
    layers: BaseLayer[],
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
        ? renderGapCell(index, layer, keyPrefix, GapComponent)
        : renderActionCell(index, layer, keyPrefix, buildContent),
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
