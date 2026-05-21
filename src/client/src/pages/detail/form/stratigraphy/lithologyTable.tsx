import { FC, ReactNode, useCallback, useContext, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Stack, Typography } from "@mui/material";
import { BaseLayer } from "../../../../api/stratigraphy.ts";
import { theme } from "../../../../AppTheme.ts";
import { AddRowButton } from "../../../../components/buttons/buttons.tsx";
import { SaveContext } from "../../saveContext.tsx";
import { FaciesDescription } from "./faciesDescription.ts";
import { LithologicalDescription } from "./lithologicalDescription.ts";
import { Lithology } from "./lithology.ts";
import { DepthInput } from "./lithology/depthInput.tsx";
import { FaciesDescriptionLabels } from "./lithology/faciesDescriptionLabels.tsx";
import { LithologyLabels } from "./lithology/lithologyLabels.tsx";
import { defaultRowHeight, DepthLayer, flagErrors, getInitialDepthLayers } from "./lithologyTableUtils.ts";
import {
  LayerAddButton,
  StratigraphyTableActionCell,
  StratigraphyTableCell,
  StratigraphyTableColumn,
  StratigraphyTableContent,
  StratigraphyTableDescriptionGap,
  StratigraphyTableHeader,
  StratigraphyTableHeaderCell,
} from "./stratigraphyTableComponents.tsx";

interface LithologyTableProps {
  lithologies: Lithology[];
  lithologicalDescriptions: LithologicalDescription[];
  faciesDescriptions: FaciesDescription[];
  stratigraphyId: number;
}

export const LithologyTable: FC<LithologyTableProps> = ({
  lithologies,
  lithologicalDescriptions,
  faciesDescriptions,
  stratigraphyId,
}) => {
  const { t } = useTranslation();
  const { markAsChanged } = useContext(SaveContext);

  const [depths, setDepths] = useState<DepthLayer[]>([]);
  const [tmpLithologies, setTmpLithologies] = useState<Lithology[]>([]);
  const [tmpLithologicalDescriptions, setTmpLithologicalDescriptions] = useState<LithologicalDescription[]>([]);
  const [tmpFaciesDescriptions, setTmpFaciesDescriptions] = useState<FaciesDescription[]>([]);

  useEffect(() => {
    const { cleanDepths, cleanLithologies, cleanLithologicalDescriptions, cleanFaciesDescriptions } =
      getInitialDepthLayers(lithologies, lithologicalDescriptions, faciesDescriptions, stratigraphyId);
    setDepths(cleanDepths);
    setTmpLithologies(cleanLithologies);
    setTmpLithologicalDescriptions(cleanLithologicalDescriptions);
    setTmpFaciesDescriptions(cleanFaciesDescriptions);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const updateDepthBoundaries = useCallback(
    (depthId: string, side: "from" | "to", newValue: number) => {
      const primaryIndex = depths.findIndex(d => d.id === depthId);
      if (primaryIndex < 0) return;
      const primary = depths[primaryIndex];
      const oldValue = side === "from" ? primary.fromDepth : primary.toDepth;
      if (oldValue === newValue) return;

      const sideUpdates = new Map<string, "from" | "to">();
      sideUpdates.set(depthId, side);

      // Bring the immediately adjacent depth layer along on the opposite side, since it shares the boundary.
      if (side === "to") {
        const next = depths[primaryIndex + 1];
        if (next && next.fromDepth === oldValue) sideUpdates.set(next.id, "from");
      } else {
        const prev = depths[primaryIndex - 1];
        if (prev && prev.toDepth === oldValue) sideUpdates.set(prev.id, "to");
      }

      // Update depth layers
      const newDepths = depths.map(d => {
        const updSide = sideUpdates.get(d.id);
        if (!updSide) return d;
        return updSide === "from" ? { ...d, fromDepth: newValue } : { ...d, toDepth: newValue };
      });

      // Update data layers
      const propagate = <T extends BaseLayer>(items: T[]): T[] =>
        items.map(item => {
          if (!item.depthIds || item.depthIds.length === 0) return item;
          let newFromDepth = item.fromDepth;
          let newToDepth = item.toDepth;
          let changed = false;
          for (const id of item.depthIds) {
            const updSide = sideUpdates.get(id);
            if (!updSide) continue;
            if (updSide === "from" && item.fromDepth === oldValue) {
              newFromDepth = newValue;
              changed = true;
            } else if (updSide === "to" && item.toDepth === oldValue) {
              newToDepth = newValue;
              changed = true;
            }
          }
          if (!changed) return item;
          return { ...item, fromDepth: newFromDepth, toDepth: newToDepth };
        });

      const newLithologies = propagate(tmpLithologies);
      const newLithologicalDescriptions = propagate(tmpLithologicalDescriptions);
      const newFaciesDescriptions = propagate(tmpFaciesDescriptions);

      // Re-flag errors so newly-created zero-thickness layers are highlighted and stale
      // flags get cleared when an edit resolves the error.
      setDepths(flagErrors(newDepths, newLithologies));

      // TODO: Check if there are actual changes by comparing json
      setTmpLithologies(newLithologies);
      setTmpLithologicalDescriptions(newLithologicalDescriptions);
      setTmpFaciesDescriptions(newFaciesDescriptions);
      markAsChanged(true);
    },
    [depths, tmpLithologies, tmpLithologicalDescriptions, tmpFaciesDescriptions, markAsChanged],
  );

  const renderGapCell = (index: number, keyPrefix: string, layer: BaseLayer, onEdit: (index: number) => void) => {
    return (
      <StratigraphyTableDescriptionGap
        key={`${keyPrefix}-${index}-${layer.fromDepth}-${layer.id}`}
        dataCy={`${keyPrefix}-${layer.fromDepth}-${layer.id}`}
        sx={{
          height: `${defaultRowHeight * (layer.depthIds?.length ?? 1)}px`,
        }}
        index={index}
        onClick={onEdit}
      />
    );
  };

  const renderActionCell = (
    index: number,
    keyPrefix: string,
    layer: BaseLayer,
    buildContent: (layer: BaseLayer) => ReactNode,
    onEdit: (index: number) => void,
    onDelete?: (index: number) => void,
  ) => (
    <StratigraphyTableActionCell
      key={`${keyPrefix}-${index}-${layer.fromDepth}-${layer.id}`}
      dataCy={`${keyPrefix}-${layer.fromDepth}-${layer.toDepth}`}
      sx={{
        height: `${defaultRowHeight * (layer.depthIds?.length ?? 1)}px`,
      }}
      isAutoCorrected={layer.isAutoCorrected}
      index={index}
      onClick={onEdit}
      onHoverClick={onDelete ? index => onDelete(index) : undefined}>
      {buildContent(layer)}
    </StratigraphyTableActionCell>
  );

  const buildGapLayer = (fromDepth: number, toDepth: number): BaseLayer => ({
    id: 0,
    stratigraphyId: stratigraphyId,
    fromDepth,
    toDepth,
    depthIds: depths.filter(d => d.fromDepth >= fromDepth && d.toDepth <= toDepth).map(d => d.id),
  });

  const renderTableCells = (
    keyPrefix: string,
    layers: BaseLayer[],
    buildContent: (layer: BaseLayer) => ReactNode,
    onEdit: (index: number) => void,
    onDelete?: (index: number) => void,
  ) => {
    const cells: ReactNode[] = [];
    const firstDepth = depths[0];
    const lastDepth = depths[depths.length - 1];
    const firstLayer = layers[0];
    const lastLayer = layers[layers.length - 1];

    // Leading gap: depths exist before the first layer starts
    if (firstLayer && firstDepth && firstLayer.fromDepth > firstDepth.fromDepth) {
      cells.push(renderGapCell(-1, keyPrefix, buildGapLayer(firstDepth.fromDepth, firstLayer.fromDepth), onEdit));
    }

    layers.forEach((layer, index) => {
      const previousLayer = layers[index - 1];
      if (previousLayer && layer.fromDepth > previousLayer.toDepth) {
        cells.push(renderGapCell(index, keyPrefix, buildGapLayer(previousLayer.toDepth, layer.fromDepth), onEdit));
      }
      cells.push(renderActionCell(index, keyPrefix, layer, buildContent, onEdit, onDelete));
    });

    // Trailing gap: depths exist after the last layer ends
    if (lastLayer && lastDepth && lastLayer.toDepth < lastDepth.toDepth) {
      cells.push(renderGapCell(layers.length, keyPrefix, buildGapLayer(lastLayer.toDepth, lastDepth.toDepth), onEdit));
    }

    return cells;
  };

  return (
    <Stack gap={1.5}>
      <Stack>
        <StratigraphyTableHeader>
          <StratigraphyTableHeaderCell sx={{ flex: "0 0 120px" }} label={t("depth")} />
          <StratigraphyTableHeaderCell label={t("lithology")} />
          <StratigraphyTableHeaderCell label={t("lithological_description")} />
          <StratigraphyTableHeaderCell label={t("facies_description")} />
        </StratigraphyTableHeader>
        {depths?.length > 0 && (
          <StratigraphyTableContent>
            <StratigraphyTableColumn sx={{ flex: "0 0 120px" }}>
              {depths.map((depth, index) => {
                const isFirst = index === 0;
                const isLast = index === depths.length - 1;
                const bottomBoundaryError = depth.hasToDepthError || (!isLast && depths[index + 1].hasFromDepthError);
                return (
                  <StratigraphyTableCell
                    key={`${depth.id}-depth-${depth.fromDepth}-${depth.toDepth}`}
                    data-cy={`depth-${depth.fromDepth}-${depth.toDepth}`}
                    sx={{ height: `${defaultRowHeight}px`, position: "relative", overflow: "visible" }}>
                    {isFirst && (
                      <DepthInput
                        value={depth.fromDepth}
                        hasError={depth.hasFromDepthError}
                        onCommit={newDepth => updateDepthBoundaries(depth.id, "from", newDepth)}
                        dataCy={`depth-from-${depth.fromDepth}-input`}
                        sx={{
                          position: "absolute",
                          top: theme.spacing(2),
                          left: "50%",
                          transform: "translateX(-50%)",
                        }}
                      />
                    )}
                    <DepthInput
                      value={depth.toDepth}
                      hasError={bottomBoundaryError}
                      onCommit={newDepth => updateDepthBoundaries(depth.id, "to", newDepth)}
                      dataCy={`depth-to-${depth.toDepth}-input`}
                      sx={{
                        position: "absolute",
                        left: "50%",
                        ...(isLast
                          ? {
                              bottom: theme.spacing(2),
                              transform: "translateX(-50%)",
                            }
                          : {
                              bottom: 0,
                              transform: "translate(-50%, 50%)",
                              zIndex: 1,
                            }),
                      }}
                    />
                  </StratigraphyTableCell>
                );
              })}
            </StratigraphyTableColumn>
            <StratigraphyTableColumn>
              {renderTableCells(
                "lithology",
                tmpLithologies,
                layer => (
                  <LithologyLabels lithology={layer as Lithology} />
                ),
                index => console.log(`edit lithology ${index}`),
              )}
            </StratigraphyTableColumn>
            <StratigraphyTableColumn>
              {renderTableCells(
                `lithologicalDescription`,
                tmpLithologicalDescriptions,
                layer => (
                  <Typography variant="body1" fontWeight={700}>
                    {(layer as LithologicalDescription).description}
                  </Typography>
                ),
                index => console.log(`edit lithologicalDescription ${index}`),
                index => console.log(`delete lithologicalDescription ${index}`),
              )}
            </StratigraphyTableColumn>
            <StratigraphyTableColumn>
              {renderTableCells(
                `faciesDescription`,
                tmpFaciesDescriptions,
                layer => (
                  <FaciesDescriptionLabels description={layer as FaciesDescription} />
                ),
                index => console.log(`edit faciesDescription ${index}`),
                index => console.log(`delete faciesDescription ${index}`),
              )}
            </StratigraphyTableColumn>
          </StratigraphyTableContent>
        )}
      </Stack>
      <AddRowButton
        onClick={() => console.log("add new depth layer at the end")}
        dataCy="add-row-button"
        buttonContent={<LayerAddButton />}
      />
    </Stack>
  );
};
