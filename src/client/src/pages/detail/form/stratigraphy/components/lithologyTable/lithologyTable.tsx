import { FC, ReactNode, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Stack, Typography } from "@mui/material";
import { BaseLayer } from "../../../../../../api/stratigraphy.ts";
import { theme } from "../../../../../../AppTheme.ts";
import { AddRowButton } from "../../../../../../components/buttons/buttons.tsx";
import { FaciesDescription } from "../../faciesDescription.ts";
import { LithologicalDescription } from "../../lithologicalDescription.ts";
import { Lithology } from "../../lithology.ts";
import { FaciesDescriptionLabels } from "../../lithology/faciesDescriptionLabels.tsx";
import { FaciesDescriptionModal } from "../../lithology/form/faciesDescriptionModal.tsx";
import { LithologicalDescriptionModal } from "../../lithology/form/lithologicalDescriptionModal.tsx";
import { LithologyModal } from "../../lithology/form/lithologyModal.tsx";
import { LithologyLabels } from "../../lithology/lithologyLabels.tsx";
import { DepthColumnCell } from "../depthColumnCell.tsx";
import { DepthDeleteButton } from "../depthDeleteButton.tsx";
import { DepthInput } from "../depthInput.tsx";
import { DepthInsertButton } from "../depthInsertButton.tsx";
import { DescriptionResizeHandle } from "../descriptionResize/descriptionResizeHandle.tsx";
import { ResizeKind, useDescriptionResize } from "../descriptionResize/useDescriptionResize.ts";
import { LayerAddButton } from "../layerAddButton.tsx";
import { StratigraphyTableActionCell } from "../stratigraphyTableActionCell.tsx";
import { StratigraphyTableDescriptionGap } from "../stratigraphyTableDescriptionGap.tsx";
import { StratigraphyTableHeaderCell } from "../stratigraphyTableHeaderCell.tsx";
import {
  defaultRowHeight,
  StratigraphyTableColumn,
  StratigraphyTableContent,
  StratigraphyTableHeader,
} from "../stratigraphyTablePrimitives.tsx";
import { LithologyTableState } from "./useLithologyTableState.ts";

type LithologyTableColumn = "lithology" | "lithologicalDescription" | "faciesDescription";
const allColumns: LithologyTableColumn[] = ["lithology", "lithologicalDescription", "faciesDescription"];

interface LithologyTableProps {
  state: LithologyTableState;
  shownColumns?: LithologyTableColumn[];
}

export const LithologyTable: FC<LithologyTableProps> = ({ state, shownColumns = allColumns }) => {
  const { t } = useTranslation();
  const {
    depths,
    tmpLithologies,
    tmpLithologicalDescriptions,
    tmpFaciesDescriptions,
    stratigraphyId,
    updateDepthBoundaries,
    handleAddDepthLayer,
    handleInsertDepthRow,
    handleDeleteDepthLayer,
    handleDeleteDescription,
    resizeDescription,
    updateTmpLithology,
    updateTmpLithologicalDescription,
    updateTmpFaciesDescription,
  } = state;

  const shown = useMemo(() => new Set(shownColumns), [shownColumns]);
  const showLithology = shown.has("lithology");
  const showLithologicalDescription = shown.has("lithologicalDescription");
  const showFaciesDescription = shown.has("faciesDescription");

  const [selectedLithology, setSelectedLithology] = useState<Lithology>();
  const [selectedLithologicalDescription, setSelectedLithologicalDescription] = useState<LithologicalDescription>();
  const [selectedFaciesDescription, setSelectedFaciesDescription] = useState<FaciesDescription>();

  const [openMenuDepthId, setOpenMenuDepthId] = useState<string | null>(null);
  const [trashHoverDepthId, setTrashHoverDepthId] = useState<string | null>(null);
  const deletePreviewDepthId = openMenuDepthId ?? trashHoverDepthId;
  const deletePreviewDepth = depths.find(d => d.id === deletePreviewDepthId);
  const isMarkedForDelete = (layer: BaseLayer): boolean =>
    !!deletePreviewDepth &&
    layer.fromDepth === deletePreviewDepth.fromDepth &&
    layer.toDepth === deletePreviewDepth.toDepth;

  const [hoveredItemDepthIds, setHoveredItemDepthIds] = useState<ReadonlySet<string>>(new Set());

  const handleItemMouseEnter = (depthIds: string[] | undefined) => {
    setHoveredItemDepthIds(depthIds && depthIds.length > 0 ? new Set(depthIds) : new Set());
  };
  const handleItemMouseLeave = () => setHoveredItemDepthIds(new Set());

  const { activeDrag, previewRange, startResizeDrag } = useDescriptionResize({
    depths,
    tmpLithologicalDescriptions,
    tmpFaciesDescriptions,
    resizeDescription,
  });

  const handleLithologyUpdate = (updated: Lithology, hasChanges: boolean) => {
    updateTmpLithology(updated, hasChanges);
    setSelectedLithology(undefined);
  };

  const handleLithologicalDescriptionUpdate = (updated: LithologicalDescription, hasChanges: boolean) => {
    updateTmpLithologicalDescription(updated, hasChanges);
    setSelectedLithologicalDescription(undefined);
  };

  const handleFaciesDescriptionUpdate = (updated: FaciesDescription, hasChanges: boolean) => {
    updateTmpFaciesDescription(updated, hasChanges);
    setSelectedFaciesDescription(undefined);
  };

  const handleAddLithologicalDescriptionInGap = (depthId: string, fromDepth: number, toDepth: number) => {
    setSelectedLithologicalDescription({
      id: 0,
      stratigraphyId,
      fromDepth,
      toDepth,
      depthIds: [depthId],
    });
  };

  const handleAddFaciesDescriptionInGap = (depthId: string, fromDepth: number, toDepth: number) => {
    setSelectedFaciesDescription({
      id: 0,
      stratigraphyId,
      fromDepth,
      toDepth,
      faciesId: null,
      depthIds: [depthId],
    });
  };

  const buildResizeHandles = (
    kind: ResizeKind,
    itemIdx: number,
    layer: BaseLayer,
    itemIndexByDepthId: Map<string, number>,
  ): ReactNode => {
    const ids = layer.depthIds ?? [];
    if (ids.length === 0) return null;
    const firstIdx = depths.findIndex(d => d.id === ids[0]);
    const lastIdx = depths.findIndex(d => d.id === ids.at(-1));
    if (firstIdx < 0 || lastIdx < 0) return null;
    const hasGap = (depthIdx: number) => {
      if (depthIdx < 0 || depthIdx >= depths.length) return false;
      return !itemIndexByDepthId.has(depths[depthIdx].id);
    };
    const canShrink = ids.length > 1;
    const showTop = hasGap(firstIdx - 1) || canShrink;
    const showBottom = hasGap(lastIdx + 1) || canShrink;
    if (!showTop && !showBottom) return null;
    return (
      <>
        {showTop && (
          <DescriptionResizeHandle
            key={`resize-top-${itemIdx}`}
            kind={kind}
            side="top"
            fromDepth={layer.fromDepth}
            toDepth={layer.toDepth}
            onMouseDown={event => startResizeDrag(event, kind, itemIdx, layer, "top")}
          />
        )}
        {showBottom && (
          <DescriptionResizeHandle
            key={`resize-bottom-${itemIdx}`}
            kind={kind}
            side="bottom"
            fromDepth={layer.fromDepth}
            toDepth={layer.toDepth}
            onMouseDown={event => startResizeDrag(event, kind, itemIdx, layer, "bottom")}
          />
        )}
      </>
    );
  };

  const renderGapCell = (
    index: number,
    keyPrefix: string,
    depthId: string,
    fromDepth: number,
    toDepth: number,
    onAddInGap?: (depthId: string, fromDepth: number, toDepth: number) => void,
  ) => {
    return (
      <StratigraphyTableDescriptionGap
        key={`${keyPrefix}-${index}-${fromDepth}-${depthId}`}
        dataCy={`${keyPrefix}-${fromDepth}-${depthId}`}
        sx={{
          height: `${defaultRowHeight}px`,
        }}
        index={index}
        onClick={onAddInGap ? () => onAddInGap(depthId, fromDepth, toDepth) : undefined}
        onMouseEnter={() => handleItemMouseEnter([depthId])}
        onMouseLeave={handleItemMouseLeave}
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
    resizeHandles?: ReactNode,
    heightInRows?: number,
  ) => (
    <StratigraphyTableActionCell
      key={`${keyPrefix}-${index}-${layer.fromDepth}-${layer.id}`}
      dataCy={`${keyPrefix}-${layer.fromDepth}-${layer.toDepth}`}
      sx={{
        height: `${defaultRowHeight * (heightInRows ?? layer.depthIds?.length ?? 1)}px`,
        ...(isMarkedForDelete(layer) && {
          backgroundColor: theme.palette.error.background,
          "&:hover": { backgroundColor: theme.palette.error.backgroundHover },
        }),
      }}
      isAutoCorrected={layer.isAutoCorrected}
      index={index}
      onClick={onEdit}
      onHoverClick={onDelete ? index => onDelete(index) : undefined}
      onMouseEnter={() => handleItemMouseEnter(layer.depthIds)}
      onMouseLeave={handleItemMouseLeave}
      resizeHandles={resizeHandles}>
      {buildContent(layer)}
    </StratigraphyTableActionCell>
  );

  const renderTableCells = (
    keyPrefix: string,
    layers: BaseLayer[],
    buildContent: (layer: BaseLayer) => ReactNode,
    onEdit: (index: number) => void,
    onDelete?: (index: number) => void,
    onAddInGap?: (depthId: string, fromDepth: number, toDepth: number) => void,
    resizableKind?: ResizeKind,
  ): ReactNode[] => {
    // Apply the in-flight resize preview to the matching description (only the description's
    // own column — preview is purely visual; commit happens on mouseup via resizeDescription).
    const effectiveLayers =
      activeDrag && previewRange && resizableKind === activeDrag.kind
        ? layers.map((layer, i) => {
            if (i !== activeDrag.itemIdx) return layer;
            const newDepthIds = depths
              .filter(d => {
                if (d.fromDepth === d.toDepth) {
                  return d.fromDepth > previewRange.fromDepth && d.fromDepth < previewRange.toDepth;
                }
                return d.fromDepth >= previewRange.fromDepth && d.toDepth <= previewRange.toDepth;
              })
              .map(d => d.id);
            return {
              ...layer,
              fromDepth: previewRange.fromDepth,
              toDepth: previewRange.toDepth,
              depthIds: newDepthIds,
            };
          })
        : layers;

    const itemIndexByDepthId = new Map<string, number>();
    effectiveLayers.forEach((layer, idx) => {
      for (const id of layer.depthIds ?? []) {
        itemIndexByDepthId.set(id, idx);
      }
    });

    const cells: ReactNode[] = [];
    const renderedItems = new Set<number>();
    depths.forEach((depth, depthIdx) => {
      const itemIdx = itemIndexByDepthId.get(depth.id);
      if (itemIdx === undefined) {
        cells.push(renderGapCell(depthIdx, keyPrefix, depth.id, depth.fromDepth, depth.toDepth, onAddInGap));
      } else if (!renderedItems.has(itemIdx)) {
        const layer = effectiveLayers[itemIdx];
        const handles = resizableKind
          ? buildResizeHandles(resizableKind, itemIdx, layer, itemIndexByDepthId)
          : undefined;
        cells.push(
          renderActionCell(
            itemIdx,
            keyPrefix,
            layer,
            buildContent,
            onEdit,
            onDelete,
            handles,
            layer.depthIds?.length ?? 1,
          ),
        );
        renderedItems.add(itemIdx);
      }
      // else: item already rendered at an earlier depth and its cell spans through here.
    });

    return cells;
  };

  return (
    <Stack gap={1.5}>
      <Stack>
        <StratigraphyTableHeader>
          <StratigraphyTableHeaderCell sx={{ flex: "0 0 128px" }} label={t("depth")} />
          {showLithology && <StratigraphyTableHeaderCell label={t("lithology")} />}
          {showLithologicalDescription && <StratigraphyTableHeaderCell label={t("lithological_description")} />}
          {showFaciesDescription && <StratigraphyTableHeaderCell label={t("facies_description")} />}
        </StratigraphyTableHeader>
        {depths?.length > 0 && (
          <StratigraphyTableContent>
            <StratigraphyTableColumn sx={{ flex: "0 0 128px" }}>
              {depths.map((depth, index) => {
                const isFirst = index === 0;
                const isLast = index === depths.length - 1;
                const isOnly = depths.length === 1;
                const bottomBoundaryError = depth.hasToDepthError || (!isLast && depths[index + 1].hasFromDepthError);
                const isHoveredViaItem = hoveredItemDepthIds.has(depth.id);
                const isMenuOpenForThis = openMenuDepthId === depth.id;
                return (
                  <DepthColumnCell
                    key={`${depth.id}-depth-${depth.fromDepth}-${depth.toDepth}`}
                    depth={depth}
                    showHoverContent={isMenuOpenForThis || isHoveredViaItem}
                    isDeletePreview={deletePreviewDepth?.id === depth.id}>
                    {isFirst && (
                      <DepthInput
                        value={depth.fromDepth}
                        hasError={depth.hasFromDepthError}
                        onCommit={newDepth => updateDepthBoundaries(depth.id, "from", newDepth)}
                        dataCy={`depth-from-${depth.fromDepth}-${depth.toDepth}-input`}
                        position="first"
                      />
                    )}
                    <DepthDeleteButton
                      depth={depth}
                      isFirst={isFirst}
                      isLast={isLast}
                      isOnly={isOnly}
                      onDelete={handleDeleteDepthLayer}
                      onMouseEnter={() => setTrashHoverDepthId(depth.id)}
                      onMouseLeave={() => setTrashHoverDepthId(null)}
                      onMenuOpenChange={isOpen => setOpenMenuDepthId(isOpen ? depth.id : null)}
                    />
                    {deletePreviewDepth?.id !== depth.id && (
                      <>
                        <DepthInsertButton depth={depth} position="before" onClick={handleInsertDepthRow} />
                        <DepthInsertButton depth={depth} position="after" onClick={handleInsertDepthRow} />
                      </>
                    )}
                    <DepthInput
                      value={depth.toDepth}
                      hasError={bottomBoundaryError}
                      onCommit={newDepth => updateDepthBoundaries(depth.id, "to", newDepth)}
                      dataCy={`depth-to-${depth.fromDepth}-${depth.toDepth}-input`}
                      position={isLast ? "last" : "default"}
                    />
                  </DepthColumnCell>
                );
              })}
            </StratigraphyTableColumn>
            {showLithology && (
              <StratigraphyTableColumn>
                {renderTableCells(
                  "lithology",
                  tmpLithologies,
                  layer => (
                    <LithologyLabels lithology={layer as Lithology} />
                  ),
                  index => setSelectedLithology(tmpLithologies[index]),
                )}
              </StratigraphyTableColumn>
            )}
            {showLithologicalDescription && (
              <StratigraphyTableColumn>
                {renderTableCells(
                  `lithologicalDescription`,
                  tmpLithologicalDescriptions,
                  layer => (
                    <Typography variant="body1" fontWeight={700}>
                      {(layer as LithologicalDescription).description}
                    </Typography>
                  ),
                  index => setSelectedLithologicalDescription(tmpLithologicalDescriptions[index]),
                  index => handleDeleteDescription("lithological", index),
                  handleAddLithologicalDescriptionInGap,
                  "lithological",
                )}
              </StratigraphyTableColumn>
            )}
            {showFaciesDescription && (
              <StratigraphyTableColumn>
                {renderTableCells(
                  `faciesDescription`,
                  tmpFaciesDescriptions,
                  layer => (
                    <FaciesDescriptionLabels description={layer as FaciesDescription} />
                  ),
                  index => setSelectedFaciesDescription(tmpFaciesDescriptions[index]),
                  index => handleDeleteDescription("facies", index),
                  handleAddFaciesDescriptionInGap,
                  "facies",
                )}
              </StratigraphyTableColumn>
            )}
          </StratigraphyTableContent>
        )}
      </Stack>
      <AddRowButton onClick={handleAddDepthLayer} dataCy="add-row-button" buttonContent={<LayerAddButton />} />
      <LithologyModal lithology={selectedLithology} updateLithology={handleLithologyUpdate} />
      <LithologicalDescriptionModal
        description={selectedLithologicalDescription}
        updateLithologicalDescription={handleLithologicalDescriptionUpdate}
      />
      <FaciesDescriptionModal
        description={selectedFaciesDescription}
        updateFaciesDescription={handleFaciesDescriptionUpdate}
      />
    </Stack>
  );
};
