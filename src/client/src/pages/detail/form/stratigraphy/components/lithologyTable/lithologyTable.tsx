import { FC, ReactNode, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Stack, Typography } from "@mui/material";
import { theme } from "../../../../../../AppTheme.ts";
import { AddRowButton } from "../../../../../../components/buttons/buttons.tsx";
import { useCopyToClipboard } from "../../../../../../hooks/useCopyToClipboard.ts";
import { FaciesDescriptionLabels } from "../../lithology/faciesDescriptionLabels.tsx";
import { FaciesDescriptionModal } from "../../lithology/form/faciesDescriptionModal.tsx";
import { LithologicalDescriptionModal } from "../../lithology/form/lithologicalDescriptionModal.tsx";
import { findMatchingLithologicalDescription } from "../../lithology/form/lithologyDescriptionMatching.ts";
import { LithologyModal } from "../../lithology/form/lithologyModal.tsx";
import { LithologyLabels } from "../../lithology/lithologyLabels.tsx";
import {
  BaseLayer,
  DescriptionKind,
  FaciesDescription,
  LithologicalDescription,
  Lithology,
} from "../../stratigraphy.ts";
import { DepthColumnCell } from "../depthColumnCell.tsx";
import { DepthDeleteButton } from "../depthDeleteButton.tsx";
import { DepthInput } from "../depthInput.tsx";
import { DepthInsertButton } from "../depthInsertButton.tsx";
import { DepthLabel } from "../depthLabel.tsx";
import { DescriptionResizeHandle } from "../descriptionResize/descriptionResizeHandle.tsx";
import { ResizeSide, useDescriptionResize } from "../descriptionResize/useDescriptionResize.ts";
import { useGapRangeSelect } from "../descriptionResize/useGapRangeSelect.ts";
import { LayerAddButton } from "../layerAddButton.tsx";
import { StratigraphyTableActionCell } from "../stratigraphyTableActionCell.tsx";
import { StratigraphyTableDescriptionGap } from "../stratigraphyTableDescriptionGap.tsx";
import { StratigraphyTableHeaderCell } from "../stratigraphyTableHeaderCell.tsx";
import {
  defaultRowHeight,
  StratigraphyTableCell,
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
  readOnly?: boolean;
}

export const LithologyTable: FC<LithologyTableProps> = ({ state, shownColumns = allColumns, readOnly = false }) => {
  const { t } = useTranslation();
  const copyToClipboard = useCopyToClipboard();
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

  const tableRef = useRef<HTMLDivElement>(null);
  const { activeDrag, previewRange, startResizeDrag } = useDescriptionResize({
    depths,
    tmpLithologicalDescriptions,
    tmpFaciesDescriptions,
    resizeDescription,
    containerRef: tableRef,
  });

  const handleLithologyUpdate = (updated: Lithology, hasChanges: boolean) => {
    updateTmpLithology(updated, hasChanges);
    setSelectedLithology(undefined);
  };

  const matchingLithologicalDescription = useMemo(
    () =>
      selectedLithology
        ? findMatchingLithologicalDescription(selectedLithology, tmpLithologicalDescriptions)
        : undefined,
    [selectedLithology, tmpLithologicalDescriptions],
  );

  const handleLithologicalDescriptionUpdate = (updated: LithologicalDescription, hasChanges: boolean) => {
    updateTmpLithologicalDescription(updated, hasChanges);
    setSelectedLithologicalDescription(undefined);
  };

  const handleFaciesDescriptionUpdate = (updated: FaciesDescription, hasChanges: boolean) => {
    updateTmpFaciesDescription(updated, hasChanges);
    setSelectedFaciesDescription(undefined);
  };

  const openDescriptionModalForRange = (kind: DescriptionKind, selectedDepthIds: string[]) => {
    if (selectedDepthIds.length === 0) return;
    const firstDepth = depths.find(d => d.id === selectedDepthIds[0]);
    const lastDepth = depths.find(d => d.id === selectedDepthIds.at(-1));
    if (!firstDepth || !lastDepth) return;
    const range = { fromDepth: firstDepth.fromDepth, toDepth: lastDepth.toDepth, depthIds: selectedDepthIds };
    if (kind === "lithological") {
      setSelectedLithologicalDescription({ id: 0, stratigraphyId, ...range });
    } else {
      setSelectedFaciesDescription({ id: 0, stratigraphyId, faciesId: null, ...range });
    }
  };

  const { activeSelection, previewDepthIds, startGapSelect } = useGapRangeSelect({
    depths,
    tmpLithologicalDescriptions,
    tmpFaciesDescriptions,
    onCommit: openDescriptionModalForRange,
    containerRef: tableRef,
  });

  const buildResizeHandles = (
    kind: DescriptionKind,
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
    const isActive = (side: ResizeSide) =>
      activeDrag?.kind === kind && activeDrag.itemIdx === itemIdx && activeDrag.side === side;
    const canShrink = ids.length > 1;
    const showTop = hasGap(firstIdx - 1) || canShrink || isActive("top");
    const showBottom = hasGap(lastIdx + 1) || canShrink || isActive("bottom");
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
            isActive={isActive("top")}
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
            isActive={isActive("bottom")}
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
    fromDepth: number | null,
    selectableKind?: DescriptionKind,
  ) => {
    return (
      <StratigraphyTableDescriptionGap
        key={`${keyPrefix}-${index}-${fromDepth}-${depthId}`}
        dataCy={`${keyPrefix}-${fromDepth}-${depthId}`}
        sx={{
          height: `${defaultRowHeight}px`,
        }}
        onMouseDown={selectableKind ? event => startGapSelect(event, selectableKind, index) : undefined}
        isSelected={!!selectableKind && selectableKind === activeSelection?.kind && previewDepthIds.has(depthId)}
        onMouseEnter={() => handleItemMouseEnter([depthId])}
        onMouseLeave={handleItemMouseLeave}
      />
    );
  };

  const renderActionCell = ({
    index,
    keyPrefix,
    layer,
    buildContent,
    onEdit,
    onDelete,
    resizeHandles,
    heightInRows,
  }: {
    index: number;
    keyPrefix: string;
    layer: BaseLayer;
    buildContent: (layer: BaseLayer) => ReactNode;
    onEdit: (index: number) => void;
    onDelete?: (index: number) => void;
    resizeHandles?: ReactNode;
    heightInRows?: number;
  }) => (
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
      onClick={readOnly ? undefined : onEdit}
      onHoverClick={!readOnly && onDelete ? index => onDelete(index) : undefined}
      onCopy={readOnly ? copyToClipboard : undefined}
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
    resizableKind?: DescriptionKind,
  ): ReactNode[] => {
    const effectiveResizableKind = readOnly ? undefined : resizableKind;

    // Apply the in-flight resize preview to the matching description (only the description's
    // own column — preview is purely visual; commit happens on mouseup via resizeDescription).
    const effectiveLayers =
      activeDrag && previewRange && effectiveResizableKind === activeDrag.kind
        ? layers.map((layer, i) => {
            if (i !== activeDrag.itemIdx) return layer;
            return {
              ...layer,
              fromDepth: previewRange.fromDepth,
              toDepth: previewRange.toDepth,
              depthIds: previewRange.depthIds,
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
        cells.push(renderGapCell(depthIdx, keyPrefix, depth.id, depth.fromDepth, effectiveResizableKind));
      } else if (!renderedItems.has(itemIdx)) {
        const layer = effectiveLayers[itemIdx];
        const resizeHandles = effectiveResizableKind
          ? buildResizeHandles(effectiveResizableKind, itemIdx, layer, itemIndexByDepthId)
          : undefined;
        cells.push(
          renderActionCell({
            index: itemIdx,
            keyPrefix,
            layer,
            buildContent,
            onEdit,
            onDelete,
            resizeHandles,
            heightInRows: layer.depthIds?.length ?? 1,
          }),
        );
        renderedItems.add(itemIdx);
      }
      // else: item already rendered at an earlier depth and its cell spans through here.
    });

    return cells;
  };

  return (
    <Stack gap={1.5} ref={tableRef}>
      <Stack>
        <StratigraphyTableHeader>
          <StratigraphyTableHeaderCell sx={{ flex: "0 0 128px" }} label={t("depthMD")} />
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
                if (readOnly) {
                  return (
                    <StratigraphyTableCell
                      key={depth.id}
                      data-cy={`depth-${depth.fromDepth}-${depth.toDepth}`}
                      sx={{ height: `${defaultRowHeight}px`, position: "relative", overflow: "visible" }}>
                      {isFirst && (
                        <DepthLabel
                          value={depth.fromDepth}
                          position="first"
                          dataCy={`depth-from-${depth.fromDepth}-${depth.toDepth}-label`}
                        />
                      )}
                      <DepthLabel
                        value={depth.toDepth}
                        position={isLast ? "last" : "default"}
                        dataCy={`depth-to-${depth.fromDepth}-${depth.toDepth}-label`}
                      />
                    </StratigraphyTableCell>
                  );
                }
                const isOnly = depths.length === 1;
                const bottomBoundaryError = depth.hasToDepthError || (!isLast && depths[index + 1].hasFromDepthError);
                const isHoveredViaItem = hoveredItemDepthIds.has(depth.id);
                const isMenuOpenForThis = openMenuDepthId === depth.id;
                return (
                  <DepthColumnCell
                    key={depth.id}
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
                    <Typography variant="body1" fontWeight={700} sx={{ whiteSpace: "pre-line" }}>
                      {(layer as LithologicalDescription).description}
                    </Typography>
                  ),
                  index => setSelectedLithologicalDescription(tmpLithologicalDescriptions[index]),
                  index => handleDeleteDescription("lithological", index),
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
                  "facies",
                )}
              </StratigraphyTableColumn>
            )}
          </StratigraphyTableContent>
        )}
      </Stack>
      {!readOnly && (
        <>
          <AddRowButton onClick={handleAddDepthLayer} dataCy="add-row-button" buttonContent={<LayerAddButton />} />
          <LithologyModal
            lithology={selectedLithology}
            lithologicalDescription={matchingLithologicalDescription}
            updateLithology={handleLithologyUpdate}
            updateLithologicalDescription={updateTmpLithologicalDescription}
          />
          <LithologicalDescriptionModal
            description={selectedLithologicalDescription}
            updateLithologicalDescription={handleLithologicalDescriptionUpdate}
          />
          <FaciesDescriptionModal
            description={selectedFaciesDescription}
            updateFaciesDescription={handleFaciesDescriptionUpdate}
          />
        </>
      )}
    </Stack>
  );
};
