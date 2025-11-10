import { Dispatch, FC, ReactNode, SetStateAction, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Stack, Typography } from "@mui/material";
import {
  BaseLayer,
  FaciesDescription,
  LithologicalDescription,
  MinimalLayer,
  useFaciesDescriptionMutations,
  useLithologicalDescriptionMutations,
} from "../../../../../../api/stratigraphy.ts";
import { AlertContext } from "../../../../../../components/alert/alertContext.tsx";
import { SaveContext } from "../../../../saveContext.tsx";
import { LayerDepth, Lithology, useLithologyMutations } from "../../lithology.ts";
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
import { BaseLayerChangeTracker, getLayerDepths, getLayersWithGaps } from "../../stratigraphyUtils.ts";
import { FaciesDescriptionLabels } from "./faciesDescriptionLabels.tsx";
import { FaciesDescriptionModal } from "./form/faciesDescriptionModal.tsx";
import { LithologicalDescriptionModal } from "./form/lithologicalDescriptionModal.tsx";
import { LithologyModal } from "./form/lithologyModal.tsx";
import { LithologyLabels } from "./lithologyLabels.tsx";

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

  const [tmpLithologies, setTmpLithologies] = useState<BaseLayerChangeTracker[]>([]);
  const tmpLithologiesFlat = useMemo(() => tmpLithologies.map(l => l.item as Lithology), [tmpLithologies]);
  const [tmpLithologicalDescriptions, setTmpLithologicalDescriptions] = useState<BaseLayerChangeTracker[]>([]);
  const tmpLithologicalDescriptionsFlat = useMemo(
    () => tmpLithologicalDescriptions.map(l => l.item as LithologicalDescription),
    [tmpLithologicalDescriptions],
  );
  const [tmpFaciesDescriptions, setTmpFaciesDescriptions] = useState<BaseLayerChangeTracker[]>([]);
  const tmpFaciesDescriptionsFlat = useMemo(
    () => tmpFaciesDescriptions.map(l => l.item as FaciesDescription),
    [tmpFaciesDescriptions],
  );

  const [depths, setDepths] = useState<LayerDepth[]>([]);

  const [selectedLithologyIndex, setSelectedLithologyIndex] = useState<number>();
  const selectedLithology = useMemo(() => {
    if (selectedLithologyIndex === undefined) return undefined;
    if (selectedLithologyIndex === -1) {
      return {
        fromDepth: depths?.at(-1)?.toDepth,
        toDepth: undefined,
        id: 0,
        isGap: true,
        stratigraphyId: 0,
        isUnconsolidated: tmpLithologiesFlat?.at(-1)?.isUnconsolidated ?? true,
        hasBedding: false,
      } as MinimalLayer as Lithology;
    }
    return tmpLithologiesFlat.at(selectedLithologyIndex);
  }, [depths, selectedLithologyIndex, tmpLithologiesFlat]);

  const [selectedLithologicalDescriptionIndex, setSelectedLithologicalDescriptionIndex] = useState<number>();
  const selectedLithologicalDescription = useMemo(() => {
    if (selectedLithologicalDescriptionIndex === undefined) return undefined;
    return tmpLithologicalDescriptionsFlat.at(selectedLithologicalDescriptionIndex);
  }, [selectedLithologicalDescriptionIndex, tmpLithologicalDescriptionsFlat]);

  const [selectedFaciesDescriptionIndex, setSelectedFaciesDescriptionIndex] = useState<number>();
  const selectedFaciesDescription = useMemo(() => {
    if (selectedFaciesDescriptionIndex === undefined) return undefined;
    return tmpFaciesDescriptionsFlat.at(selectedFaciesDescriptionIndex);
  }, [selectedFaciesDescriptionIndex, tmpFaciesDescriptionsFlat]);

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
    (
      index: number | undefined,
      item: BaseLayer,
      setState: Dispatch<SetStateAction<BaseLayerChangeTracker[]>>,
      hasChanges: boolean,
    ) => {
      setState(prev => {
        if (hasChanges) {
          markAsChanged(true);
          item.isGap = false;

          if (typeof index === "number" && index >= 0 && index < prev.length) {
            const updated = [...prev];

            updated[index] = { item, hasChanges: true };
            return updated;
          }

          // fallback to add if index is undefined or out of bounds
          return [...prev, { item, hasChanges: true }];
        }

        return prev;
      });
    },
    [markAsChanged],
  );

  const updateTmpLithology = useCallback(
    (lithology: Lithology, hasChanges: boolean) => {
      updateStratigraphyItem(selectedLithologyIndex, lithology, setTmpLithologies, hasChanges);
      setSelectedLithologyIndex(undefined);
    },
    [selectedLithologyIndex, updateStratigraphyItem],
  );

  const handleEditLithology = useCallback((layerIndex: number) => {
    setSelectedLithologyIndex(layerIndex);
  }, []);

  const handleDeleteLithology = useCallback(
    (index: number) => {
      setTmpLithologies(prev => {
        if (index >= 0 && index < prev.length) {
          const newTmpLithologies = [...prev.slice(0, index), ...prev.slice(index + 1)];
          markAsChanged(true);
          return newTmpLithologies;
        }

        return prev;
      });
    },
    [markAsChanged],
  );

  const updateTmpLithologicalDescription = useCallback(
    (lithologicalDescription: LithologicalDescription, hasChanges: boolean) => {
      updateStratigraphyItem(
        selectedLithologicalDescriptionIndex,
        lithologicalDescription,
        setTmpLithologicalDescriptions,
        hasChanges,
      );
      setSelectedLithologicalDescriptionIndex(undefined);
    },
    [selectedLithologicalDescriptionIndex, updateStratigraphyItem],
  );

  const handleEditLithologicalDescription = useCallback((index: number) => {
    setSelectedLithologicalDescriptionIndex(index);
  }, []);

  const handleDeleteLithologicalDescription = useCallback(
    (index: number) => {
      setTmpLithologicalDescriptions(prev => {
        if (index >= 0 && index < prev.length) {
          const newTmpLithologicalDescriptions = [...prev.slice(0, index), ...prev.slice(index + 1)];
          markAsChanged(true);
          return newTmpLithologicalDescriptions;
        }

        return prev;
      });
    },
    [markAsChanged],
  );

  const updateTmpFaciesDescription = useCallback(
    (faciesDescription: FaciesDescription, hasChanges: boolean) => {
      updateStratigraphyItem(selectedFaciesDescriptionIndex, faciesDescription, setTmpFaciesDescriptions, hasChanges);
      setSelectedFaciesDescriptionIndex(undefined);
    },
    [selectedFaciesDescriptionIndex, updateStratigraphyItem],
  );

  const handleEditFaciesDescription = useCallback((index: number) => {
    setSelectedFaciesDescriptionIndex(index);
  }, []);

  const handleDeleteFaciesDescription = useCallback(
    (index: number) => {
      setTmpFaciesDescriptions(prev => {
        if (index >= 0 && index < prev.length) {
          const newTmpFaciesDescriptions = [...prev.slice(0, index), ...prev.slice(index + 1)];
          markAsChanged(true);
          return newTmpFaciesDescriptions;
        }

        return prev;
      });
    },
    [markAsChanged],
  );

  const getDepthOptions = useCallback(
    (layer: BaseLayer | undefined, layers: BaseLayer[], getForToDepths: boolean = false) => {
      if (!layer || !tmpLithologiesFlat) return [];
      let allPossibleDepths: number[] = [tmpLithologiesFlat[0].fromDepth, ...tmpLithologiesFlat.map(c => c.toDepth)];
      const layerIndex = layers.findIndex(l => l.fromDepth === layer.fromDepth && l.toDepth === layer.toDepth);
      let previousLayer = layers[layerIndex - 1] ?? null;
      let nextLayer = layers[layerIndex + 1] ?? null;
      // Ignore gap layers when restricting depth options
      if (previousLayer?.isGap) {
        previousLayer = layers[layerIndex - 2] ?? null;
      }
      if (nextLayer?.isGap) {
        nextLayer = layers[layerIndex + 2] ?? null;
      }

      allPossibleDepths = previousLayer ? allPossibleDepths.filter(d => d >= previousLayer.toDepth) : allPossibleDepths;
      allPossibleDepths = nextLayer ? allPossibleDepths.filter(d => d <= nextLayer.fromDepth) : allPossibleDepths;

      return getForToDepths ? allPossibleDepths.slice(1) : allPossibleDepths.slice(0, -1);
    },
    [tmpLithologiesFlat],
  );

  const initTmpLayers = useCallback(() => {
    const initDepths = getLayerDepths(lithologies, lithologicalDescriptions, faciesDescriptions);

    const tmpLithologies = getLayersWithGaps(
      lithologies.map(layer => ({ item: layer, hasChanges: false })),
      initDepths,
      stratigraphyId,
    );
    setTmpLithologies(tmpLithologies);

    const tmpLithologicalDescriptions = getLayersWithGaps(
      lithologicalDescriptions.map(layer => ({ item: layer, hasChanges: false })),
      initDepths,
      stratigraphyId,
      true,
    );
    setTmpLithologicalDescriptions(tmpLithologicalDescriptions);

    const tmpFaciesDescriptions = getLayersWithGaps(
      faciesDescriptions.map(layer => ({ item: layer, hasChanges: false })),
      initDepths,
      stratigraphyId,
      true,
    );
    setTmpFaciesDescriptions(tmpFaciesDescriptions);
    setDepths(initDepths);
  }, [lithologies, lithologicalDescriptions, faciesDescriptions, stratigraphyId]);

  useEffect(() => {
    if (tmpLithologies.length > 0 || tmpLithologicalDescriptions.length > 0 || tmpFaciesDescriptions.length > 0) {
      const updatedDepths = getLayerDepths(
        tmpLithologies.map(l => l.item as Lithology),
        tmpLithologicalDescriptions.map(l => l.item as LithologicalDescription),
        tmpFaciesDescriptions.map(l => l.item as FaciesDescription),
      );
      if (JSON.stringify(updatedDepths) !== JSON.stringify(depths)) {
        setDepths(updatedDepths);
      }

      const newTmpLithologies = getLayersWithGaps(tmpLithologies, updatedDepths, stratigraphyId);
      if (JSON.stringify(newTmpLithologies) !== JSON.stringify(tmpLithologies)) {
        setTmpLithologies(newTmpLithologies);
      }

      const newTmpLithologicalDescriptions = getLayersWithGaps(
        tmpLithologicalDescriptions,
        updatedDepths,
        stratigraphyId,
        true,
      );
      if (JSON.stringify(newTmpLithologicalDescriptions) !== JSON.stringify(tmpLithologicalDescriptions)) {
        setTmpLithologicalDescriptions(newTmpLithologicalDescriptions);
      }

      const newTmpFaciesDescriptions = getLayersWithGaps(tmpFaciesDescriptions, updatedDepths, stratigraphyId, true);
      if (JSON.stringify(newTmpFaciesDescriptions) !== JSON.stringify(tmpFaciesDescriptions)) {
        setTmpFaciesDescriptions(newTmpFaciesDescriptions);
      }
    }
  }, [tmpLithologies, tmpLithologicalDescriptions, tmpFaciesDescriptions, depths, stratigraphyId]);

  useEffect(() => {
    initTmpLayers();
  }, [initTmpLayers]);

  const onReset = useCallback(async () => {
    initTmpLayers();
  }, [initTmpLayers]);

  const deleteLithologies = useCallback(async () => {
    for (const lithology of lithologies) {
      if (!tmpLithologies.some(l => l.item.id === lithology.id)) {
        await deleteLithology(lithology);
      }
    }
  }, [deleteLithology, lithologies, tmpLithologies]);

  const addAndUpdateLithologies = useCallback(async () => {
    for (const lithology of tmpLithologies.filter(l => l.hasChanges).map(l => l.item as Lithology)) {
      if (lithology.id === 0) {
        await addLithology({ ...lithology, stratigraphyId });
      } else {
        await updateLithology(lithology);
      }
    }
  }, [addLithology, stratigraphyId, tmpLithologies, updateLithology]);

  const deleteLithologicalDescriptions = useCallback(async () => {
    for (const lithologicalDescription of lithologicalDescriptions) {
      if (!tmpLithologicalDescriptions.some(l => l.item.id === lithologicalDescription.id)) {
        await deleteLithologicalDescription(lithologicalDescription);
      }
    }
  }, [deleteLithologicalDescription, lithologicalDescriptions, tmpLithologicalDescriptions]);

  const addAndUpdateLithologicalDescriptions = useCallback(async () => {
    for (const lithologicalDescription of tmpLithologicalDescriptions
      .filter(l => l.hasChanges)
      .map(l => l.item as LithologicalDescription)) {
      if (lithologicalDescription.id === 0) {
        await addLithologicalDescription({ ...lithologicalDescription, stratigraphyId });
      } else {
        await updateLithologicalDescription(lithologicalDescription);
      }
    }
  }, [addLithologicalDescription, stratigraphyId, tmpLithologicalDescriptions, updateLithologicalDescription]);

  const deleteFaciesDescriptions = useCallback(async () => {
    for (const faciesDescription of faciesDescriptions) {
      if (!tmpFaciesDescriptions.some(l => l.item.id === faciesDescription.id)) {
        await deleteFaciesDescription(faciesDescription);
      }
    }
  }, [deleteFaciesDescription, faciesDescriptions, tmpFaciesDescriptions]);

  const addAndUpdateFaciesDescriptions = useCallback(async () => {
    for (const faciesDescription of tmpFaciesDescriptions
      .filter(l => l.hasChanges)
      .map(l => l.item as FaciesDescription)) {
      if (faciesDescription.id === 0) {
        await addFaciesDescription({ ...faciesDescription, stratigraphyId });
      } else {
        await updateFaciesDescription(faciesDescription);
      }
    }
  }, [addFaciesDescription, stratigraphyId, tmpFaciesDescriptions, updateFaciesDescription]);

  const onSave = useCallback(async () => {
    if (depths.some(c => c.hasFromDepthError || c.hasToDepthError)) {
      showAlert(t(t("gapOrOverlayErrorCannotSave")), "error");
      return false;
    }
    await Promise.all([
      deleteLithologies(),
      addAndUpdateLithologies(),
      deleteLithologicalDescriptions(),
      addAndUpdateLithologicalDescriptions(),
      deleteFaciesDescriptions(),
      addAndUpdateFaciesDescriptions(),
    ]);
    return true;
  }, [
    depths,
    deleteLithologies,
    addAndUpdateLithologies,
    deleteLithologicalDescriptions,
    addAndUpdateLithologicalDescriptions,
    deleteFaciesDescriptions,
    addAndUpdateFaciesDescriptions,
    showAlert,
    t,
  ]);

  useEffect(() => {
    registerSaveHandler(onSave, "lithology");
    registerResetHandler(onReset, "lithology");
  }, [onReset, onSave, registerResetHandler, registerSaveHandler]);

  const renderGapCell = (
    index: number,
    layer: BaseLayer,
    keyPrefix: string,
    defaultRowHeight: number,
    computeCellHeight: ((fromDepth: number, toDepth: number) => number) | null,
    onEdit: (index: number) => void,
  ) => {
    return (
      <StratigraphyTableGap
        key={`${keyPrefix}-${layer.fromDepth}-${layer.id}`}
        sx={{
          height: `${computeCellHeight ? computeCellHeight(layer.fromDepth, layer.toDepth) : defaultRowHeight}px`,
        }}
        index={index}
        onClick={onEdit}
      />
    );
  };

  const renderActionCell = (
    index: number,
    layer: BaseLayer,
    keyPrefix: string,
    defaultRowHeight: number,
    computeCellHeight: ((fromDepth: number, toDepth: number) => number) | null,
    onEdit: (index: number) => void,
    onDelete: (index: number) => void,
    buildContent: (layer: BaseLayer) => ReactNode,
  ) => (
    <StratigraphyTableActionCell
      key={`${keyPrefix}-${layer.fromDepth}-${layer.id}`}
      sx={{
        height: `${computeCellHeight ? computeCellHeight(layer.fromDepth, layer.toDepth) : defaultRowHeight}px`,
      }}
      index={index}
      layer={layer}
      onClick={onEdit}
      onHoverClick={index => onDelete(index)}>
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
    onEdit: (index: number) => void,
    onDelete: (index: number) => void,
    buildContent: (layer: BaseLayer) => ReactNode,
    keyPrefix: string,
  ) => {
    return layers.map((layer, index) => {
      if (layer.isGap) {
        const gapLayer: BaseLayer = { ...layer };
        // only add isUnconsolidated if the layers are Lithology
        if (isLithology(layer)) {
          gapLayer.isUnconsolidated = (layers.at(index - 1) as Lithology)?.isUnconsolidated ?? true;
        }
        return renderGapCell(index, gapLayer, keyPrefix, defaultRowHeight, computeCellHeight, onEdit);
      }
      return renderActionCell(
        index,
        layer,
        keyPrefix,
        defaultRowHeight,
        computeCellHeight,
        onEdit,
        onDelete,
        buildContent,
      );
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
                {/* TODO: Add FormInput for depths and update lithology if depth changes. https://github.com/swisstopo/swissgeol-boreholes-suite/issues/2392  Add overlap validation check */}
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
                  tmpLithologiesFlat,
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
                  tmpLithologicalDescriptionsFlat,
                  defaultRowHeight,
                  computeCellHeight,
                  handleEditLithologicalDescription,
                  handleDeleteLithologicalDescription,
                  layer => (
                    <Typography variant="body1" fontWeight={700}>
                      {(layer as LithologicalDescription).description}
                    </Typography>
                  ),
                  `lithologicalDescription`,
                )}
              </StratigraphyTableColumn>
              <StratigraphyTableColumn>
                {renderTableCells(
                  tmpFaciesDescriptionsFlat,
                  defaultRowHeight,
                  computeCellHeight,
                  handleEditFaciesDescription,
                  handleDeleteFaciesDescription,
                  layer => (
                    <FaciesDescriptionLabels description={layer as FaciesDescription} />
                  ),
                  `faciesDescription`,
                )}
              </StratigraphyTableColumn>
            </StratigraphyTableContent>
          )}
        </Stack>
        <AddRowButton onClick={() => handleEditLithology(-1)} />
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
