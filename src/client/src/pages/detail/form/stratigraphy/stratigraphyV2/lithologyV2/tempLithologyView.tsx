import { FC, ReactNode, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { Stack, Typography } from "@mui/material";
import { BaseLayer } from "../../../../../../api/stratigraphy.ts";
import { Lithology } from "../../lithology.ts";
import {
  StratigraphyTableActionCell,
  StratigraphyTableCell,
  StratigraphyTableColumn,
  StratigraphyTableContent,
  StratigraphyTableGap,
  StratigraphyTableHeader,
  StratigraphyTableHeaderCell,
} from "../../stratigraphyTableComponents.tsx";
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
  const { completedLayers: completedLithologicalDescriptions } = useCompletedLayers(lithologicalDescriptions, depths);
  const { completedLayers: completedFaciesDescriptions } = useCompletedLayers(faciesDescriptions, depths);

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
  ) => (
    <StratigraphyTableGap
      key={`${keyPrefix}-${layer.id}`}
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
  ) => {
    if (!layers || layers.length === 0) {
      return <StratigraphyTableGap key={`${keyPrefix}-new`} sx={{ height: `${defaultRowHeight}px` }} index={-1} />;
    }

    return layers.map((layer, index) =>
      layer.isGap
        ? renderGapCell(index, layer, keyPrefix, defaultRowHeight, computeCellHeight)
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
              depths.map((depth, index) => (
                <StratigraphyTableCell key={`depth-${index}`} sx={{ height: `${defaultRowHeight}px` }}>
                  <Typography>{`${depth.fromDepth} m MD`}</Typography>
                  <Typography>{`${depth.toDepth} m MD`}</Typography>
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
            )}
          </StratigraphyTableColumn>
          <StratigraphyTableColumn>
            {renderTableCells(
              completedFaciesDescriptions,
              defaultRowHeight,
              computeCellHeight,
              layer => (
                <Typography variant="body1" fontWeight={700}>
                  {(layer as FaciesDescription).description}
                </Typography>
              ),
              "faciesDescription",
            )}
          </StratigraphyTableColumn>
        </StratigraphyTableContent>
      </Stack>
    </Stack>
  );
};
