import { FC, MouseEvent, ReactNode, useCallback, useContext, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Stack, Typography } from "@mui/material";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import { Trash2 } from "lucide-react";
import { v4 as uuidv4 } from "uuid";
import { BaseLayer } from "../../../../api/stratigraphy.ts";
import { theme } from "../../../../AppTheme.ts";
import { AddRowButton, StandaloneIconButton } from "../../../../components/buttons/buttons.tsx";
import { SaveContext } from "../../saveContext.tsx";
import { FaciesDescription } from "./faciesDescription.ts";
import { LithologicalDescription } from "./lithologicalDescription.ts";
import { Lithology } from "./lithology.ts";
import { DepthInput } from "./lithology/depthInput.tsx";
import { FaciesDescriptionLabels } from "./lithology/faciesDescriptionLabels.tsx";
import { LithologyLabels } from "./lithology/lithologyLabels.tsx";
import {
  createEmptyLithology,
  defaultRowHeight,
  DepthLayer,
  flagErrors,
  getInitialDepthLayers,
  mergeAdjacentDepths,
  removeDepthIdReferences,
} from "./lithologyTableUtils.ts";
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

  const [deleteMenu, setDeleteMenu] = useState<{ anchorEl: HTMLElement; depthId: string } | null>(null);
  const [hoveredDeleteDepthId, setHoveredDeleteDepthId] = useState<string | null>(null);
  const previewDeleteDepthId = deleteMenu?.depthId ?? hoveredDeleteDepthId;
  const previewDeleteDepth = depths.find(d => d.id === previewDeleteDepthId);
  const isMarkedForDelete = (layer: BaseLayer): boolean =>
    !!previewDeleteDepth &&
    layer.fromDepth === previewDeleteDepth.fromDepth &&
    layer.toDepth === previewDeleteDepth.toDepth;

  const baselineRef = useRef({
    lithologies: "[]",
    lithologicalDescriptions: "[]",
    faciesDescriptions: "[]",
  });

  useEffect(() => {
    const { cleanDepths, cleanLithologies, cleanLithologicalDescriptions, cleanFaciesDescriptions } =
      getInitialDepthLayers(lithologies, lithologicalDescriptions, faciesDescriptions, stratigraphyId);
    baselineRef.current = {
      lithologies: JSON.stringify(cleanLithologies),
      lithologicalDescriptions: JSON.stringify(cleanLithologicalDescriptions),
      faciesDescriptions: JSON.stringify(cleanFaciesDescriptions),
    };
    setDepths(cleanDepths);
    setTmpLithologies(cleanLithologies);
    setTmpLithologicalDescriptions(cleanLithologicalDescriptions);
    setTmpFaciesDescriptions(cleanFaciesDescriptions);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const commitChanges = useCallback(
    (
      newDepths: DepthLayer[],
      newLithologies: Lithology[],
      newLithologicalDescriptions: LithologicalDescription[],
      newFaciesDescriptions: FaciesDescription[],
    ) => {
      const newLithologiesJson = JSON.stringify(newLithologies);
      const newLithologicalDescriptionsJson = JSON.stringify(newLithologicalDescriptions);
      const newFaciesDescriptionsJson = JSON.stringify(newFaciesDescriptions);

      const depthsChanged = JSON.stringify(newDepths) !== JSON.stringify(depths);
      const lithologiesChanged = newLithologiesJson !== JSON.stringify(tmpLithologies);
      const lithologicalDescriptionsChanged =
        newLithologicalDescriptionsJson !== JSON.stringify(tmpLithologicalDescriptions);
      const faciesDescriptionsChanged = newFaciesDescriptionsJson !== JSON.stringify(tmpFaciesDescriptions);

      if (!depthsChanged && !lithologiesChanged && !lithologicalDescriptionsChanged && !faciesDescriptionsChanged) {
        return;
      }

      if (depthsChanged) setDepths(newDepths);
      if (lithologiesChanged) setTmpLithologies(newLithologies);
      if (lithologicalDescriptionsChanged) setTmpLithologicalDescriptions(newLithologicalDescriptions);
      if (faciesDescriptionsChanged) setTmpFaciesDescriptions(newFaciesDescriptions);

      const matchesBaseline =
        newLithologiesJson === baselineRef.current.lithologies &&
        newLithologicalDescriptionsJson === baselineRef.current.lithologicalDescriptions &&
        newFaciesDescriptionsJson === baselineRef.current.faciesDescriptions;
      markAsChanged(!matchesBaseline);
    },
    [depths, tmpLithologies, tmpLithologicalDescriptions, tmpFaciesDescriptions, markAsChanged],
  );

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

      commitChanges(
        flagErrors(newDepths, newLithologies),
        newLithologies,
        newLithologicalDescriptions,
        newFaciesDescriptions,
      );
    },
    [depths, tmpLithologies, tmpLithologicalDescriptions, tmpFaciesDescriptions, commitChanges],
  );

  const handleAddDepthLayer = useCallback(() => {
    const lastDepth = depths[depths.length - 1];
    const lastLithology = tmpLithologies[tmpLithologies.length - 1];
    const newBoundary = lastDepth?.toDepth ?? 0;
    const newDepthLayer: DepthLayer = {
      id: uuidv4(),
      fromDepth: newBoundary,
      toDepth: newBoundary,
    };
    const newLithology: Lithology = {
      ...createEmptyLithology(newBoundary, newBoundary, stratigraphyId, lastLithology?.isUnconsolidated ?? true),
      depthIds: [newDepthLayer.id],
    };
    const newDepths = [...depths, newDepthLayer];
    const newLithologies = [...tmpLithologies, newLithology];
    commitChanges(
      flagErrors(newDepths, newLithologies),
      newLithologies,
      tmpLithologicalDescriptions,
      tmpFaciesDescriptions,
    );
  }, [depths, tmpLithologies, tmpLithologicalDescriptions, tmpFaciesDescriptions, stratigraphyId, commitChanges]);

  // Delete a description and merge any depth layers it referenced whose exact range is no
  // longer matched by any remaining item. The previous adjacent depth layer absorbs the
  // candidate (its toDepth is extended). Depth-layer ids on the survivors stay put; items
  // just have the absorbed-layer ids dropped from their depthIds.
  const handleDeleteDescription = useCallback(
    (kind: "lithological" | "facies", index: number) => {
      const list = kind === "lithological" ? tmpLithologicalDescriptions : tmpFaciesDescriptions;
      if (index < 0 || index >= list.length) return;
      const deletedItem = list[index];
      const trimmed = [...list.slice(0, index), ...list.slice(index + 1)];
      const newLithologicalDescriptions = kind === "lithological" ? trimmed : tmpLithologicalDescriptions;
      const newFaciesDescriptions = kind === "facies" ? trimmed : tmpFaciesDescriptions;

      // Exact (fromDepth-toDepth) ranges still claimed by some remaining item.
      const ownedRanges = new Set<string>();
      for (const items of [tmpLithologies, newLithologicalDescriptions, newFaciesDescriptions] as BaseLayer[][]) {
        for (const item of items) {
          ownedRanges.add(`${item.fromDepth}-${item.toDepth}`);
        }
      }

      // Merge candidates: depth layers the deleted item referenced whose range is no longer
      // owned (no remaining item has matching fromDepth+toDepth).
      const candidates = new Set<string>();
      for (const id of deletedItem.depthIds ?? []) {
        const depth = depths.find(d => d.id === id);
        if (depth && !ownedRanges.has(`${depth.fromDepth}-${depth.toDepth}`)) {
          candidates.add(id);
        }
      }

      const { depths: mergedDepths, mergedIds } = mergeAdjacentDepths(depths, candidates);

      const updatedLithologies = removeDepthIdReferences(tmpLithologies, mergedIds);
      const updatedLithologicalDescriptions = removeDepthIdReferences(newLithologicalDescriptions, mergedIds);
      const updatedFaciesDescriptions = removeDepthIdReferences(newFaciesDescriptions, mergedIds);

      commitChanges(
        flagErrors(mergedDepths, updatedLithologies),
        updatedLithologies,
        updatedLithologicalDescriptions,
        updatedFaciesDescriptions,
      );
    },
    [depths, tmpLithologies, tmpLithologicalDescriptions, tmpFaciesDescriptions, commitChanges],
  );

  const handleDeleteDepthLayer = useCallback(
    (depthId: string, action: "extendLower" | "extendUpper" | "reduceBoreholeEnd") => {
      if (depths.length === 1) {
        commitChanges([], [], [], []);
        return;
      }

      const index = depths.findIndex(d => d.id === depthId);
      if (index < 0) return;
      const depthLayerToDelete = depths[index];
      const depthLayerToUpdate =
        action === "extendUpper" ? depths[index - 1] : action === "extendLower" ? depths[index + 1] : null;

      const updatedDepthLayers = depths.flatMap((d, i) => {
        if (i === index) return [];
        if (action === "extendLower" && i === index + 1) return [{ ...d, fromDepth: depthLayerToDelete.fromDepth }];
        if (action === "extendUpper" && i === index - 1) return [{ ...d, toDepth: depthLayerToDelete.toDepth }];
        return [{ ...d }];
      });

      // Remove layers that completely match deleted depth layer
      const matchesDeletedDepths = <T extends BaseLayer>(item: T) =>
        item.depthIds?.includes(depthLayerToDelete.id) &&
        item.fromDepth === depthLayerToDelete.fromDepth &&
        item.toDepth === depthLayerToDelete.toDepth;

      const updateItem = <T extends BaseLayer>(item: T): T => {
        // Remove deleted depth layer id reference
        const newDepthIds = item.depthIds?.filter(id => id === depthLayerToDelete.id);

        // Adjust items linked to the depth layer to update
        if (depthLayerToUpdate && item.depthIds?.includes(depthLayerToUpdate.id)) {
          if (action === "extendUpper" && item.toDepth === depthLayerToUpdate.toDepth) {
            return { ...item, toDepth: depthLayerToDelete.toDepth, depthIds: newDepthIds };
          }
          if (action === "extendLower" && item.fromDepth === depthLayerToUpdate.fromDepth) {
            return { ...item, fromDepth: depthLayerToDelete.fromDepth, depthIds: newDepthIds };
          }
        }

        // Shift items linked to deleted depth layer whose boundary sat on the layer's disappearing edge.
        if (item.depthIds?.includes(depthLayerToDelete.id)) {
          if (action === "extendUpper" && item.fromDepth === depthLayerToDelete.fromDepth) {
            return { ...item, fromDepth: depthLayerToDelete.toDepth, depthIds: newDepthIds };
          }
          if (
            (action === "extendLower" || action === "reduceBoreholeEnd") &&
            item.toDepth === depthLayerToDelete.toDepth
          ) {
            return { ...item, toDepth: depthLayerToDelete.fromDepth, depthIds: newDepthIds };
          }
        }

        // Keep items unrelated to the deleted or updated depth layers unchanged
        if (newDepthIds?.length === item.depthIds?.length) return item;
        return { ...item, depthIds: newDepthIds };
      };

      const newLithologies = tmpLithologies.filter(l => !matchesDeletedDepths(l)).map(updateItem);
      const newLithologicalDescriptions = tmpLithologicalDescriptions
        .filter(d => !matchesDeletedDepths(d))
        .map(updateItem);
      const newFaciesDescriptions = tmpFaciesDescriptions.filter(d => !matchesDeletedDepths(d)).map(updateItem);

      commitChanges(
        flagErrors(updatedDepthLayers, newLithologies),
        newLithologies,
        newLithologicalDescriptions,
        newFaciesDescriptions,
      );
    },
    [depths, tmpLithologies, tmpLithologicalDescriptions, tmpFaciesDescriptions, commitChanges],
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
        ...(isMarkedForDelete(layer) && {
          backgroundColor: theme.palette.error.background,
          "&:hover": { backgroundColor: theme.palette.error.backgroundHover },
        }),
      }}
      isAutoCorrected={layer.isAutoCorrected}
      index={index}
      onClick={onEdit}
      onHoverClick={onDelete ? index => onDelete(index) : undefined}>
      {buildContent(layer)}
    </StratigraphyTableActionCell>
  );

  // Each gap cell maps to exactly one depth layer (height = defaultRowHeight). A gap range
  // covering several depth layers is rendered as several gap cells, one per depth layer, so
  // the gap stays aligned with the depth column.
  const renderGapCellsForRange = (
    startIndex: number,
    keyPrefix: string,
    fromDepth: number,
    toDepth: number,
    onEdit: (index: number) => void,
  ): ReactNode[] =>
    depths
      .filter(d => d.fromDepth >= fromDepth && d.toDepth <= toDepth)
      .map((depth, i) =>
        renderGapCell(
          startIndex + i,
          keyPrefix,
          {
            id: 0,
            stratigraphyId,
            fromDepth: depth.fromDepth,
            toDepth: depth.toDepth,
            depthIds: [depth.id],
          },
          onEdit,
        ),
      );

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

    // No items at all → render a gap cell per depth layer so the column stays aligned
    // with the depth column (matters e.g. when the user just added the first row to an
    // otherwise empty stratigraphy).
    if (layers.length === 0 && firstDepth && lastDepth) {
      return renderGapCellsForRange(0, keyPrefix, firstDepth.fromDepth, lastDepth.toDepth, onEdit);
    }

    // Leading gap: depths exist before the first layer starts
    if (firstLayer && firstDepth && firstLayer.fromDepth > firstDepth.fromDepth) {
      cells.push(...renderGapCellsForRange(-1, keyPrefix, firstDepth.fromDepth, firstLayer.fromDepth, onEdit));
    }

    layers.forEach((layer, index) => {
      const previousLayer = layers[index - 1];
      if (previousLayer && layer.fromDepth > previousLayer.toDepth) {
        cells.push(...renderGapCellsForRange(index, keyPrefix, previousLayer.toDepth, layer.fromDepth, onEdit));
      }
      cells.push(renderActionCell(index, keyPrefix, layer, buildContent, onEdit, onDelete));
    });

    // Trailing gap: any depth rows after the last layer that the last layer doesn't cover.
    // Covers both the "depths extend past the last item" case and a trailing zero-thickness
    // depth at the last item's toDepth (which the item doesn't own since the zt is at its boundary).
    if (lastLayer && lastDepth && !lastLayer.depthIds?.includes(lastDepth.id)) {
      cells.push(...renderGapCellsForRange(layers.length, keyPrefix, lastLayer.toDepth, lastDepth.toDepth, onEdit));
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
                const isOnly = depths.length === 1;
                const bottomBoundaryError = depth.hasToDepthError || (!isLast && depths[index + 1].hasFromDepthError);
                const isMenuOpenForThis = deleteMenu?.depthId === depth.id;
                const onDeleteClick = (event: MouseEvent<HTMLElement>) => {
                  event.stopPropagation();
                  if (isFirst || isOnly) {
                    handleDeleteDepthLayer(depth.id, "extendLower");
                    return;
                  }
                  setDeleteMenu({ anchorEl: event.currentTarget, depthId: depth.id });
                };
                return (
                  <StratigraphyTableCell
                    key={`${depth.id}-depth-${depth.fromDepth}-${depth.toDepth}`}
                    data-cy={`depth-${depth.fromDepth}-${depth.toDepth}`}
                    sx={{
                      height: `${defaultRowHeight}px`,
                      position: "relative",
                      overflow: "visible",
                      ...(previewDeleteDepth?.id === depth.id && {
                        backgroundColor: theme.palette.error.background,
                      }),
                      "& .hover-content": { visibility: isMenuOpenForThis ? "visible" : "hidden" },
                      "&:hover .hover-content": { visibility: "visible" },
                    }}>
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
                    <Stack
                      className="hover-content"
                      sx={{
                        position: "absolute",
                        top: "50%",
                        left: "50%",
                        transform: "translate(-50%, -50%)",
                        zIndex: 2,
                      }}>
                      <StandaloneIconButton
                        icon={<Trash2 />}
                        color={isMenuOpenForThis ? undefined : "primaryInverse"}
                        onClick={onDeleteClick}
                        onMouseEnter={() => setHoveredDeleteDepthId(depth.id)}
                        onMouseLeave={() => setHoveredDeleteDepthId(null)}
                        dataCy={`delete-depth-${depth.fromDepth}-${depth.toDepth}-button`}
                        sx={{
                          backgroundColor: isMenuOpenForThis
                            ? theme.palette.buttonStates.outlined.active.backgroundColor
                            : theme.palette.background.grey,
                          ...(isMenuOpenForThis && {
                            color: theme.palette.buttonStates.outlined.active.color,
                          }),
                          "&:hover": {
                            backgroundColor: isMenuOpenForThis
                              ? theme.palette.buttonStates.outlined.active.backgroundColor
                              : theme.palette.background.grey,
                          },
                        }}
                      />
                    </Stack>
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
              <Menu
                anchorEl={deleteMenu?.anchorEl ?? null}
                open={Boolean(deleteMenu)}
                onClose={() => setDeleteMenu(null)}
                anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
                transformOrigin={{ vertical: "top", horizontal: "left" }}
                slotProps={{
                  paper: {
                    sx: {
                      marginTop: theme.spacing(0.5),
                      border: `1px solid ${theme.palette.border.darker}`,
                      boxShadow: theme.shadows[1],
                    },
                  },
                }}>
                <MenuItem
                  onClick={() => {
                    if (!deleteMenu) return;
                    handleDeleteDepthLayer(deleteMenu.depthId, "extendUpper");
                    setDeleteMenu(null);
                  }}
                  data-cy="extend-upper-layer-downward">
                  {t("extendUpperLayerDownward")}
                </MenuItem>
                {(() => {
                  const activeIndex = deleteMenu ? depths.findIndex(d => d.id === deleteMenu.depthId) : -1;
                  const activeIsLast = activeIndex >= 0 && activeIndex === depths.length - 1;
                  return (
                    <MenuItem
                      onClick={() => {
                        if (!deleteMenu) return;
                        handleDeleteDepthLayer(deleteMenu.depthId, activeIsLast ? "reduceBoreholeEnd" : "extendLower");
                        setDeleteMenu(null);
                      }}
                      data-cy={activeIsLast ? "reduce-borehole-end-depth" : "extend-lower-layer-upward"}>
                      {activeIsLast ? t("reduceBoreholeEndDepth") : t("extendLowerLayerUpward")}
                    </MenuItem>
                  );
                })()}
              </Menu>
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
                index => handleDeleteDescription("lithological", index),
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
                index => handleDeleteDescription("facies", index),
              )}
            </StratigraphyTableColumn>
          </StratigraphyTableContent>
        )}
      </Stack>
      <AddRowButton onClick={handleAddDepthLayer} dataCy="add-row-button" buttonContent={<LayerAddButton />} />
    </Stack>
  );
};
