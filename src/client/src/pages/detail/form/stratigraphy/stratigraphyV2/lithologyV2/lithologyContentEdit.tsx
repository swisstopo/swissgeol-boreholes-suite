import { FC, ReactNode, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Stack, Typography } from "@mui/material";
import { Trash2 } from "lucide-react";
import {
  BaseLayer,
  FaciesDescription,
  LithologicalDescription,
  useFaciesDescriptionMutations,
  useLithologicalDescriptionMutations,
} from "../../../../../../api/stratigraphy.ts";
import { AlertContext } from "../../../../../../components/alert/alertContext.tsx";
import { PromptContext } from "../../../../../../components/prompt/promptContext.tsx";
import { Lithology, useLithologyMutations } from "../../lithology.ts";
import { StratigraphyContext, StratigraphyContextProps } from "../../stratigraphyContext.tsx";
import {
  AddRowButton,
  StratigraphyTableActionCell,
  StratigraphyTableCell,
  StratigraphyTableColumn,
  StratigraphyTableContent,
  StratigraphyTableGap,
  StratigraphyTableHeader,
  StratigraphyTableHeaderCell,
} from "../stratigraphyTableComponents.tsx";
import { FaciesDescriptionModal } from "./form/faciesDescriptionModal.tsx";
import { LithologicalDescriptionModal } from "./form/lithologicalDescriptionModal.tsx";
import { LithologyModal } from "./form/lithologyModal.tsx";
import { LithologyLabels } from "./lithologyLabels.tsx";
import { useCompletedLayers } from "./useCompletedLayers.tsx";
import { useLayerDepths } from "./useLayerDepths.tsx";

type LithologyWithChanges = { item: Lithology; hasChanges: boolean };
type LithologicalDescriptionWithChanges = { item: LithologicalDescription; hasChanges: boolean };
type FaciesDescriptionWithChanges = { item: FaciesDescription; hasChanges: boolean };

interface LithologyContentEditProps {
  stratigraphyId: number;
  lithologies: Lithology[];
  lithologicalDescriptions: LithologicalDescription[];
  faciesDescriptions: FaciesDescription[];
}

export const LithologyContentEdit: FC<LithologyContentEditProps> = ({
  stratigraphyId,
  lithologies,
  lithologicalDescriptions,
  faciesDescriptions,
}) => {
  const { t } = useTranslation();
  const { showPrompt } = useContext(PromptContext);
  const { showAlert } = useContext(AlertContext);
  const { registerSaveHandler, registerResetHandler } = useContext<StratigraphyContextProps>(StratigraphyContext);
  const {
    add: { mutateAsync: addLithology },
    update: { mutateAsync: updateLithology },
    delete: { mutateAsync: deleteLithology },
  } = useLithologyMutations();
  const {
    add: { mutateAsync: addLithologicalDescription },
    update: { mutateAsync: updateLithologicalDescription },
    delete: { mutateAsync: deleteLithologicalDescription },
  } = useLithologicalDescriptionMutations();
  const {
    add: { mutateAsync: addFaciesDescription },
    update: { mutateAsync: updateFaciesDescription },
    delete: { mutateAsync: deleteFaciesDescription },
  } = useFaciesDescriptionMutations();
  const [tmpLithologies, setTmpLithologies] = useState<LithologyWithChanges[]>(
    lithologies.map(item => ({ item, hasChanges: false })),
  );
  const tmpLithologiesFlat = useMemo(() => tmpLithologies.map(l => l.item), [tmpLithologies]);
  const [tmpLithologicalDescriptions, setTmpLithologicalDescriptions] = useState<LithologicalDescriptionWithChanges[]>(
    lithologicalDescriptions.map(item => ({ item, hasChanges: false })),
  );
  const tmpLithologicalDescriptionsFlat = useMemo(
    () => tmpLithologicalDescriptions.map(l => l.item),
    [tmpLithologicalDescriptions],
  );
  const [tmpFaciesDescriptions, setTmpFaciesDescriptions] = useState<FaciesDescriptionWithChanges[]>(
    faciesDescriptions.map(item => ({ item, hasChanges: false })),
  );
  const tmpFaciesDescriptionsFlat = useMemo(() => tmpFaciesDescriptions.map(l => l.item), [tmpFaciesDescriptions]);

  const { depths } = useLayerDepths(tmpLithologiesFlat, tmpLithologicalDescriptionsFlat, tmpFaciesDescriptionsFlat);

  // TODO: Set isUnconsolidated for gap layers based on previous layer: if is first layer or previous layer is unconsolidated, set isUnconsolidated to true, else false
  const { completedLayers: completedLithologies } = useCompletedLayers(tmpLithologiesFlat, depths);
  const { completedLayers: completedLithologicalDescriptions } = useCompletedLayers(
    tmpLithologicalDescriptionsFlat,
    depths,
  );
  const { completedLayers: completedFaciesDescriptions } = useCompletedLayers(tmpFaciesDescriptionsFlat, depths);

  const [selectedLithology, setSelectedLithology] = useState<Lithology>();
  const [selectedLithologicalDescription, setSelectedLithologicalDescription] = useState<LithologicalDescription>();
  const [selectedFaciesDescription, setSelectedFaciesDescription] = useState<FaciesDescription>();

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

  const updateTmpLithology = useCallback((lithology: Lithology, hasChanges: boolean) => {
    if (hasChanges) {
      setTmpLithologies(prev =>
        prev.map(l =>
          (l.item.id !== 0 && l.item.id === lithology.id) ||
          (l.item.id === 0 && l.item.fromDepth === lithology.fromDepth && l.item.toDepth === lithology.toDepth)
            ? { item: lithology, hasChanges: true }
            : l,
        ),
      );
    }
    setSelectedLithology(undefined);
  }, []);

  const handleEditLithology = useCallback((layer: BaseLayer) => {
    setSelectedLithology(layer as Lithology);
  }, []);

  const handleDeleteLithology = useCallback(
    (layer: BaseLayer) => {
      const lithology = layer as Lithology;
      // TODO: How is this handled in tmpLithologies?
      deleteLithology(lithology);
    },
    [deleteLithology],
  );

  const updateTmpLithologicalDescription = useCallback((description: LithologicalDescription, hasChanges: boolean) => {
    if (hasChanges) {
      setTmpLithologicalDescriptions(prev =>
        prev.map(l =>
          (l.item.id !== 0 && l.item.id === description.id) ||
          (l.item.id === 0 && l.item.fromDepth === description.fromDepth && l.item.toDepth === description.toDepth)
            ? { item: description, hasChanges: true }
            : l,
        ),
      );
    }
    setSelectedLithologicalDescription(undefined);
  }, []);

  const handleEditLithologicalDescription = useCallback((layer: BaseLayer) => {
    setSelectedLithologicalDescription(layer as LithologicalDescription);
  }, []);

  const handleDeleteLithologicalDescription = useCallback(
    (layer: BaseLayer) => {
      const lithologicalDescription = layer as LithologicalDescription;
      // TODO: How is this handled in tmpLithologicalDescriptions?
      deleteLithologicalDescription(lithologicalDescription);
    },
    [deleteLithologicalDescription],
  );

  const updateTmpFaciesDescription = useCallback((description: FaciesDescription, hasChanges: boolean) => {
    if (hasChanges) {
      setTmpFaciesDescriptions(prev =>
        prev.map(l =>
          (l.item.id !== 0 && l.item.id === description.id) ||
          (l.item.id === 0 && l.item.fromDepth === description.fromDepth && l.item.toDepth === description.toDepth)
            ? { item: description, hasChanges: true }
            : l,
        ),
      );
    }
    setSelectedFaciesDescription(undefined);
  }, []);

  const handleEditFaciesDescription = useCallback((layer: BaseLayer) => {
    setSelectedFaciesDescription(layer as FaciesDescription);
  }, []);

  const handleDeleteFaciesDescription = useCallback(
    (layer: BaseLayer) => {
      const faciesDescription = layer as FaciesDescription;
      // TODO: How is this handled in tmpFaciesDescriptions?
      deleteFaciesDescription(faciesDescription);
    },
    [deleteFaciesDescription],
  );

  const getDepthOptions = useCallback(
    (layer: BaseLayer | undefined, options: BaseLayer[], getForToDepths: boolean = false) => {
      // TODO: Load allowed depth ranges from lithologies.
      // Limit possible values based on previous and next descriptions
      // This is called way too often, need to optimize
      console.log("getDepthOptions", { layer, options, getForToDepths });
      return [0, 10, 20];
    },
    [],
  );

  const onReset = useCallback(async () => {
    setTmpLithologies(lithologies.map(item => ({ item, hasChanges: false })));
    setTmpLithologicalDescriptions(lithologicalDescriptions.map(item => ({ item, hasChanges: false })));
    setTmpFaciesDescriptions(faciesDescriptions.map(item => ({ item, hasChanges: false })));
  }, [faciesDescriptions, lithologicalDescriptions, lithologies]);

  const onSave = useCallback(async () => {
    if (depths.some(c => c.hasFromDepthError || c.hasToDepthError)) {
      showAlert(t(t("gapOrOverlayErrorCannotSave")), "error");
      return false;
    }

    for (const lithology of tmpLithologies.filter(l => l.hasChanges).map(l => l.item)) {
      if (lithology.id === 0) {
        await addLithology({ ...lithology, stratigraphyId });
      } else {
        await updateLithology(lithology);
      }
    }
    // TODO: Re-add once migrated to new stratigraphies
    // for (const lithologicalDescription of tmpLithologicalDescriptions.filter(l => l.hasChanges).map(l => l.item)) {
    //   if (lithologicalDescription.id === 0) {
    //     await addLithologicalDescription({ ...lithologicalDescription, stratigraphyId });
    //   } else {
    //     await updateLithologicalDescription(lithologicalDescription);
    //   }
    // }
    // for (const faciesDescription of tmpFaciesDescriptions.filter(l => l.hasChanges).map(l => l.item)) {
    //   if (faciesDescription.id === 0) {
    //     await addFaciesDescription({ ...faciesDescription, stratigraphyId });
    //   } else {
    //     await updateFaciesDescription(faciesDescription);
    //   }
    // }
    return true;
    // TODO: Remove rule disable once migrated to new stratigraphies
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    addFaciesDescription,
    depths,
    addLithologicalDescription,
    addLithology,
    stratigraphyId,
    tmpFaciesDescriptions,
    tmpLithologicalDescriptions,
    tmpLithologies,
    updateFaciesDescription,
    updateLithologicalDescription,
    updateLithology,
  ]);

  useEffect(() => {
    registerSaveHandler(onSave, "lithology");
    registerResetHandler(onReset, "lithology");
  }, [onReset, onSave, registerResetHandler, registerSaveHandler]);

  useEffect(() => {
    // TODO: Update tmpLithologies but keep hasChanges where id matches
    console.log("lithologies changed", lithologies);
  }, [lithologies]);

  useEffect(() => {
    // TODO: Update tmpLithologicalDescriptions but keep hasChanges where id matches
    console.log("lithologicalDescriptions changed", lithologicalDescriptions);
  }, [lithologicalDescriptions]);

  useEffect(() => {
    // TODO: Update tmpFaciesDescriptions but keep hasChanges where id matches
    console.log("faciesDescriptions changed", faciesDescriptions);
  }, [faciesDescriptions]);

  const renderGapCell = (
    layer: BaseLayer,
    keyPrefix: string,
    defaultRowHeight: number,
    computeCellHeight: ((fromDepth: number, toDepth: number) => number) | null,
    onEdit: (layer: BaseLayer) => void,
  ) => (
    <StratigraphyTableGap
      key={`${keyPrefix}-${layer.id}`}
      sx={{
        height: `${computeCellHeight ? computeCellHeight(layer.fromDepth, layer.toDepth) : defaultRowHeight}px`,
      }}
      layer={layer}
      onClick={onEdit}
    />
  );

  const renderActionCell = (
    layer: BaseLayer,
    keyPrefix: string,
    defaultRowHeight: number,
    computeCellHeight: ((fromDepth: number, toDepth: number) => number) | null,
    onEdit: (layer: BaseLayer) => void,
    onDelete: (layer: BaseLayer) => void,
    buildContent: (layer: BaseLayer) => ReactNode,
  ) => (
    <StratigraphyTableActionCell
      key={`${keyPrefix}-${layer.id}`}
      sx={{
        height: `${computeCellHeight ? computeCellHeight(layer.fromDepth, layer.toDepth) : defaultRowHeight}px`,
      }}
      layer={layer}
      onClick={onEdit}
      onHoverClick={layer => {
        showPrompt("deleteMessage", [
          { label: "cancel" },
          {
            label: "delete",
            icon: <Trash2 />,
            variant: "contained",
            action: () => onDelete(layer),
          },
        ]);
      }}>
      {buildContent(layer)}
    </StratigraphyTableActionCell>
  );

  const renderTableCells = (
    layers: BaseLayer[],
    defaultRowHeight: number,
    computeCellHeight: ((fromDepth: number, toDepth: number) => number) | null,
    onEdit: (layer: BaseLayer) => void,
    onDelete: (layer: BaseLayer) => void,
    buildContent: (layer: BaseLayer) => ReactNode,
    keyPrefix: string,
  ) => {
    if (!layers || layers.length === 0) {
      return (
        <StratigraphyTableGap
          key={`${keyPrefix}-new`}
          sx={{ height: `${defaultRowHeight}px` }}
          layer={{ id: 0, stratigraphyId: stratigraphyId, isGap: true, fromDepth: -1, toDepth: -1 }}
          onClick={onEdit}
        />
      );
    }

    return layers.map(layer =>
      layer.isGap
        ? renderGapCell(layer, keyPrefix, defaultRowHeight, computeCellHeight, onEdit)
        : renderActionCell(layer, keyPrefix, defaultRowHeight, computeCellHeight, onEdit, onDelete, buildContent),
    );
  };

  return (
    <>
      <Stack gap={1.5}>
        <Stack>
          <StratigraphyTableHeader>
            <StratigraphyTableHeaderCell sx={{ flex: "0 0 90px" }} label={t("depth")} />
            <StratigraphyTableHeaderCell label={t("lithology")} />
            <StratigraphyTableHeaderCell label={t("lithological_description")} />
            <StratigraphyTableHeaderCell label={t("facies_description")} />
          </StratigraphyTableHeader>
          {depths?.length > 0 && (
            <StratigraphyTableContent>
              <StratigraphyTableColumn sx={{ flex: "0 0 90px" }}>
                {/* TODO: Add FormInput for depths and update lithology if depth changes. Add overlap validation check */}
                {depths.map((depth, index) => (
                  <StratigraphyTableCell key={`depth-${index}`} sx={{ height: `${defaultRowHeight}px` }}>
                    <Typography
                      color={depth.hasFromDepthError ? "error" : "default"}>{`${depth.fromDepth} m MD`}</Typography>
                    <Typography
                      color={depth.hasToDepthError ? "error" : "default"}>{`${depth.toDepth} m MD`}</Typography>
                  </StratigraphyTableCell>
                ))}
              </StratigraphyTableColumn>
              <StratigraphyTableColumn>
                {renderTableCells(
                  completedLithologies,
                  defaultRowHeight,
                  computeCellHeight,
                  handleEditLithology,
                  handleDeleteLithology,
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
                  handleEditLithologicalDescription,
                  handleDeleteLithologicalDescription,
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
                  handleEditFaciesDescription,
                  handleDeleteFaciesDescription,
                  layer => (
                    <Typography variant="body1" fontWeight={700}>
                      {(layer as FaciesDescription).description}
                    </Typography>
                  ),
                  "faciesDescription",
                )}
              </StratigraphyTableColumn>
            </StratigraphyTableContent>
          )}
        </Stack>
        <AddRowButton />
      </Stack>
      <LithologyModal lithology={selectedLithology} updateLithology={updateTmpLithology} />
      <LithologicalDescriptionModal
        description={selectedLithologicalDescription}
        fromDepths={getDepthOptions(selectedLithologicalDescription, tmpLithologicalDescriptionsFlat)}
        toDepths={getDepthOptions(selectedLithologicalDescription, tmpLithologicalDescriptionsFlat, true)}
        updateLithologicalDescription={updateTmpLithologicalDescription}
      />
      <FaciesDescriptionModal
        description={selectedFaciesDescription}
        fromDepths={getDepthOptions(selectedFaciesDescription, tmpFaciesDescriptionsFlat)}
        toDepths={getDepthOptions(selectedFaciesDescription, tmpFaciesDescriptionsFlat, true)}
        updateFaciesDescription={updateTmpFaciesDescription}
      />
    </>
  );
};
