import { Dispatch, FC, ReactNode, SetStateAction, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Stack, Typography } from "@mui/material";
import { Trash2 } from "lucide-react";
import {
  BaseLayer,
  FaciesDescription,
  LithologicalDescription,
  MinimalLayer,
  useFaciesDescriptionMutations,
  useLithologicalDescriptionMutations,
} from "../../../../../../api/stratigraphy.ts";
import { AlertContext } from "../../../../../../components/alert/alertContext.tsx";
import { PromptContext } from "../../../../../../components/prompt/promptContext.tsx";
import { SaveContext } from "../../../../saveContext.tsx";
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
} from "../../stratigraphyTableComponents.tsx";
import { FaciesDescriptionLabels } from "./faciesDescriptionLabels.tsx";
import { FaciesDescriptionModal } from "./form/faciesDescriptionModal.tsx";
import { LithologicalDescriptionModal } from "./form/lithologicalDescriptionModal.tsx";
import { LithologyModal } from "./form/lithologyModal.tsx";
import { LithologyLabels } from "./lithologyLabels.tsx";
import { useCompletedLayers } from "./useCompletedLayers.tsx";
import { useLayerDepths } from "./useLayerDepths.tsx";

type BaseLayerWithChanges = { item: BaseLayer; hasChanges: boolean };
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
  const { markAsChanged } = useContext(SaveContext);
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

  const { depths } = useLayerDepths(tmpLithologiesFlat);

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

  const updateStratigraphyItem = useCallback(
    <T extends BaseLayer>(
      item: T,
      setState: Dispatch<SetStateAction<{ item: T; hasChanges: boolean }[]>>,
      hasChanges: boolean,
    ): void => {
      setState(prev => {
        const isCompletelyNew =
          item.id === 0 &&
          !prev.some(existing => existing.item.fromDepth === item.fromDepth && existing.item.toDepth === item.toDepth);
        if (isCompletelyNew) {
          markAsChanged(true); // In case where a gap is filled without changing the initial formValues the isDirty evaluation for changes fails.
          return [...prev, { item: item, hasChanges: true }];
        } else {
          if (hasChanges) {
            return prev.map(l => {
              const isUpdatingTmp =
                l.item.id === 0 && l.item.fromDepth === item.fromDepth && l.item.toDepth === item.toDepth;
              const isUpdatingExisting = l.item.id !== 0 && l.item.id === item.id;
              return isUpdatingTmp || isUpdatingExisting ? { item, hasChanges: true } : l;
            });
          }
          return prev;
        }
      });
    },
    [markAsChanged],
  );

  const updateTmpLithology = useCallback(
    (lithology: Lithology, hasChanges: boolean) => {
      updateStratigraphyItem(lithology, setTmpLithologies, hasChanges);
      setSelectedLithology(undefined);
    },
    [updateStratigraphyItem],
  );

  const updateTmpLithologicalDescription = useCallback(
    (lithologicalDescription: LithologicalDescription, hasChanges: boolean) => {
      updateStratigraphyItem(lithologicalDescription, setTmpLithologicalDescriptions, hasChanges);
      setSelectedLithologicalDescription(undefined);
    },
    [updateStratigraphyItem],
  );

  const updateTmpFaciesDescription = useCallback(
    (faciesDescription: FaciesDescription, hasChanges: boolean) => {
      updateStratigraphyItem(faciesDescription, setTmpFaciesDescriptions, hasChanges);
      setSelectedFaciesDescription(undefined);
    },
    [updateStratigraphyItem],
  );

  const handleEditLithology = useCallback((layer: MinimalLayer) => {
    setSelectedLithology(layer as Lithology);
  }, []);

  const compareAndMarkAsChanged = (newTmpLayers: BaseLayerWithChanges[], layers: BaseLayer[]) => {
    const newTmpLayersFlat = newTmpLayers.map(l => l.item);
    const areArraysEqual = JSON.stringify(newTmpLayersFlat) === JSON.stringify(layers);
    markAsChanged(!areArraysEqual);
  };

  const handleDeleteLithology = (lithology: BaseLayer) => {
    setTmpLithologies(prev => {
      const newTmpLithologies = prev.filter(l => l.item.id !== lithology.id);
      compareAndMarkAsChanged(newTmpLithologies, lithologies);
      return newTmpLithologies;
    });
  };

  const handleEditLithologicalDescription = useCallback((layer: BaseLayer) => {
    setSelectedLithologicalDescription(layer as LithologicalDescription);
  }, []);

  const handleDeleteLithologicalDescription = (lithologicalDescription: BaseLayer) => {
    setTmpLithologicalDescriptions(prev => {
      const newTmpLithologicalDescriptions = prev.filter(l => l.item.id !== lithologicalDescription.id);
      compareAndMarkAsChanged(newTmpLithologicalDescriptions, lithologicalDescriptions);
      return newTmpLithologicalDescriptions;
    });
  };

  const handleEditFaciesDescription = useCallback((layer: BaseLayer) => {
    setSelectedFaciesDescription(layer as FaciesDescription);
  }, []);

  const handleDeleteFaciesDescription = (faciesDescription: BaseLayer) => {
    setTmpFaciesDescriptions(prev => {
      const newTmpFaciesDescriptions = prev.filter(l => l.item.id !== faciesDescription.id);
      compareAndMarkAsChanged(newTmpFaciesDescriptions, faciesDescriptions);
      return newTmpFaciesDescriptions;
    });
  };

  const getDepthOptions = useCallback(
    (layer: BaseLayer | undefined, layers: BaseLayer[], getForToDepths: boolean = false) => {
      if (!layer || !completedLithologies) return [];
      let allPossibleDepths: number[] = [
        completedLithologies[0].fromDepth,
        ...completedLithologies.map(c => c.toDepth),
      ];

      const layerIndex = layers.findIndex(l => l.id === layer.id);
      const previousLayer = layerIndex > 0 ? layers[layerIndex - 1] : null;
      const nextLayer = layerIndex < layers.length - 1 ? layers[layerIndex + 1] : null;

      allPossibleDepths = previousLayer ? allPossibleDepths.filter(d => d >= previousLayer.toDepth) : allPossibleDepths;
      allPossibleDepths = nextLayer ? allPossibleDepths.filter(d => d <= nextLayer.fromDepth) : allPossibleDepths;

      return getForToDepths ? allPossibleDepths.slice(1) : allPossibleDepths.slice(0, -1);
    },
    [completedLithologies],
  );

  useEffect(() => {
    setTmpLithologies(lithologies.map(item => ({ item, hasChanges: false })));
  }, [lithologies]);

  useEffect(() => {
    setTmpFaciesDescriptions(faciesDescriptions.map(item => ({ item, hasChanges: false })));
  }, [faciesDescriptions]);

  useEffect(() => {
    setTmpLithologicalDescriptions(lithologicalDescriptions.map(item => ({ item, hasChanges: false })));
  }, [lithologicalDescriptions]);

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

    // Check for deleted lithologies
    for (const lithology of lithologies) {
      if (!tmpLithologies.find(l => l.item.id === lithology.id)) {
        await deleteLithology(lithology);
      }
    }

    for (const lithology of tmpLithologies.filter(l => l.hasChanges).map(l => l.item)) {
      if (lithology.id === 0) {
        await addLithology({ ...lithology, stratigraphyId });
      } else {
        await updateLithology(lithology);
      }
    }
    // check for deleted lithological descriptions
    for (const lithologicalDescription of lithologicalDescriptions) {
      if (!tmpLithologicalDescriptions.find(l => l.item.id === lithologicalDescription.id)) {
        await deleteLithologicalDescription(lithologicalDescription);
      }
    }

    for (const lithologicalDescription of tmpLithologicalDescriptions.filter(l => l.hasChanges).map(l => l.item)) {
      if (lithologicalDescription.id === 0) {
        await addLithologicalDescription({ ...lithologicalDescription, stratigraphyId });
      } else {
        await updateLithologicalDescription(lithologicalDescription);
      }
    }

    // check for deleted facies descriptions
    for (const faciesDescription of faciesDescriptions) {
      if (!tmpFaciesDescriptions.find(l => l.item.id === faciesDescription.id)) {
        await deleteFaciesDescription(faciesDescription);
      }
    }

    for (const faciesDescription of tmpFaciesDescriptions.filter(l => l.hasChanges).map(l => l.item)) {
      if (faciesDescription.id === 0) {
        await addFaciesDescription({ ...faciesDescription, stratigraphyId });
      } else {
        await updateFaciesDescription(faciesDescription);
      }
    }
    markAsChanged(false);
    return true;
  }, [
    depths,
    markAsChanged,
    showAlert,
    t,
    lithologies,
    tmpLithologies,
    deleteLithology,
    addLithology,
    stratigraphyId,
    updateLithology,
    lithologicalDescriptions,
    tmpLithologicalDescriptions,
    deleteLithologicalDescription,
    addLithologicalDescription,
    updateLithologicalDescription,
    faciesDescriptions,
    tmpFaciesDescriptions,
    deleteFaciesDescription,
    addFaciesDescription,
    updateFaciesDescription,
  ]);

  useEffect(() => {
    registerSaveHandler(onSave, "lithology");
    registerResetHandler(onReset, "lithology");
  }, [onReset, onSave, registerResetHandler, registerSaveHandler]);

  const renderGapCell = (
    layer: BaseLayer,
    keyPrefix: string,
    defaultRowHeight: number,
    computeCellHeight: ((fromDepth: number, toDepth: number) => number) | null,
    onEdit: (layer: BaseLayer) => void,
    index: number,
    layers: BaseLayer[],
  ) => {
    return (
      <StratigraphyTableGap
        key={`${keyPrefix}-${layer.id}`}
        sx={{
          height: `${computeCellHeight ? computeCellHeight(layer.fromDepth, layer.toDepth) : defaultRowHeight}px`,
        }}
        layer={{
          ...layer,
          isUnconsolidated: layers.at(index - 1)?.isUnconsolidated ?? true,
        }}
        onClick={onEdit}
      />
    );
  };

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

  const isLithology = (layer: BaseLayer): layer is Lithology => {
    return (layer as Lithology).isUnconsolidated !== undefined;
  };

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

    return layers.map((layer, index) => {
      if (layer.isGap) {
        const gapLayer: BaseLayer = { ...layer };
        // only add isUnconsolidated if the layers are Lithology
        if (isLithology(layer)) {
          gapLayer.isUnconsolidated = (layers.at(index - 1) as Lithology)?.isUnconsolidated ?? true;
        }
        return renderGapCell(gapLayer, keyPrefix, defaultRowHeight, computeCellHeight, onEdit, index, layers);
      }
      return renderActionCell(layer, keyPrefix, defaultRowHeight, computeCellHeight, onEdit, onDelete, buildContent);
    });
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
                    <FaciesDescriptionLabels description={layer as FaciesDescription} />
                  ),
                  "faciesDescription",
                )}
              </StratigraphyTableColumn>
            </StratigraphyTableContent>
          )}
        </Stack>
        <AddRowButton
          onClick={() =>
            handleEditLithology({
              fromDepth: depths?.at(-1)?.toDepth,
              toDepth: undefined,
              id: 0,
              isGap: false,
              stratigraphyId: 0,
              isUnconsolidated: tmpLithologiesFlat?.at(-1)?.isUnconsolidated ?? true,
            })
          }
        />
      </Stack>
      <LithologyModal lithology={selectedLithology} updateLithology={updateTmpLithology} />
      <LithologicalDescriptionModal
        description={selectedLithologicalDescription}
        fromDepths={getDepthOptions(selectedLithologicalDescription, completedLithologicalDescriptions)}
        toDepths={getDepthOptions(selectedLithologicalDescription, completedLithologicalDescriptions, true)}
        updateLithologicalDescription={updateTmpLithologicalDescription}
      />
      <FaciesDescriptionModal
        description={selectedFaciesDescription}
        fromDepths={getDepthOptions(selectedFaciesDescription, completedFaciesDescriptions)}
        toDepths={getDepthOptions(selectedFaciesDescription, completedFaciesDescriptions, true)}
        updateFaciesDescription={updateTmpFaciesDescription}
      />
    </>
  );
};
