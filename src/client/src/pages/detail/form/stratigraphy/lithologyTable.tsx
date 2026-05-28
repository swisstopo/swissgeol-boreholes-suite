import { FC, ReactNode, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Stack, Typography } from "@mui/material";
import { BaseLayer } from "../../../../api/stratigraphy.ts";
import { theme } from "../../../../AppTheme.ts";
import { AddRowButton } from "../../../../components/buttons/buttons.tsx";
import { FaciesDescription } from "./faciesDescription.ts";
import { LithologicalDescription } from "./lithologicalDescription.ts";
import { Lithology } from "./lithology.ts";
import { DepthInput } from "./lithology/depthInput.tsx";
import { FaciesDescriptionLabels } from "./lithology/faciesDescriptionLabels.tsx";
import { FaciesDescriptionModal } from "./lithology/form/faciesDescriptionModal.tsx";
import { LithologicalDescriptionModal } from "./lithology/form/lithologicalDescriptionModal.tsx";
import { LithologyModal } from "./lithology/form/lithologyModal.tsx";
import { LithologyLabels } from "./lithology/lithologyLabels.tsx";
import { defaultRowHeight } from "./lithologyTableUtils.ts";
import {
  DepthColumnCell,
  DepthDeleteButton,
  InsertDepthButton,
  LayerAddButton,
  StratigraphyTableActionCell,
  StratigraphyTableColumn,
  StratigraphyTableContent,
  StratigraphyTableDescriptionGap,
  StratigraphyTableHeader,
  StratigraphyTableHeaderCell,
} from "./stratigraphyTableComponents.tsx";
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
      onHoverClick={onDelete ? index => onDelete(index) : undefined}
      onMouseEnter={() => handleItemMouseEnter(layer.depthIds)}
      onMouseLeave={handleItemMouseLeave}>
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
  ): ReactNode[] => {
    const itemIndexByDepthId = new Map<string, number>();
    layers.forEach((layer, idx) => {
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
        cells.push(renderActionCell(itemIdx, keyPrefix, layers[itemIdx], buildContent, onEdit, onDelete));
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
                        <InsertDepthButton depth={depth} position="before" onClick={handleInsertDepthRow} />
                        <InsertDepthButton depth={depth} position="after" onClick={handleInsertDepthRow} />
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
