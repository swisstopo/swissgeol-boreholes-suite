import { UseFormReturn } from "react-hook-form";
import { useMutation, useQuery, useQueryClient, UseQueryResult } from "@tanstack/react-query";
import { fetchApiV2Legacy, fetchApiV2WithApiError } from "../../../../api/fetchApiV2.ts";
import { BaseLayer } from "../../../../api/stratigraphy.ts";
import { Codelist } from "../../../../components/codelist.ts";
import { useResetTabStatus } from "../../../../hooks/useResetTabStatus.ts";

export const getMinMaxDepth = (
  lithologies: BaseLayer[],
  lithologicalDescriptions: BaseLayer[],
  faciesDescriptions: BaseLayer[],
): { minDepth: number; maxDepth: number } => {
  let minDepth: number | undefined;
  let maxDepth: number | undefined;

  const all = [lithologies, lithologicalDescriptions, faciesDescriptions];
  for (const arr of all) {
    for (const item of arr) {
      if (minDepth === undefined || item.fromDepth < minDepth) minDepth = item.fromDepth;
      if (maxDepth === undefined || item.toDepth > maxDepth) maxDepth = item.toDepth;
    }
  }

  return {
    minDepth: minDepth ?? 0,
    maxDepth: maxDepth ?? 0,
  };
};

const isLithology = (layer: BaseLayer): layer is Lithology => {
  return "hasBedding" in layer && "isUnconsolidated" in layer;
};

const createGapLayer = (fromDepth: number, toDepth: number, stratigraphyId: number, isUnconsolidated?: boolean) => {
  const gapLayer: BaseLayer = {
    id: 0,
    fromDepth,
    toDepth,
    isGap: true,
    stratigraphyId,
    ...(isUnconsolidated !== undefined && { hasBedding: false, isUnconsolidated }),
  };
  return { item: gapLayer, hasChanges: false } as BaseLayerChangeTracker;
};

const checkForFullRangeGap = (layers: BaseLayerChangeTracker[], minDepth: number, maxDepth: number) => {
  if (layers.length === 0 && minDepth < maxDepth) {
    return createGapLayer(minDepth, maxDepth, 0);
  }
  return undefined;
};

const checkForStartGap = (layers: BaseLayerChangeTracker[], minDepth: number) => {
  if (layers.length > 0) {
    const firstLayer = layers[0];
    if (minDepth < firstLayer.item.fromDepth) {
      return createGapLayer(
        minDepth,
        firstLayer.item.fromDepth,
        firstLayer.item.stratigraphyId,
        isLithology(firstLayer.item) ? true : undefined,
      );
    }
  }
  return undefined;
};

const checkForGapBetween = (current: BaseLayerChangeTracker, prev?: BaseLayerChangeTracker) => {
  if (prev && current.item.fromDepth > prev.item.toDepth) {
    return createGapLayer(
      prev.item.toDepth,
      current.item.fromDepth,
      current.item.stratigraphyId,
      isLithology(prev.item) ? (prev.item.isUnconsolidated ?? true) : undefined,
    );
  }
  return undefined;
};

const checkForEndGap = (layers: BaseLayerChangeTracker[], maxDepth: number) => {
  if (layers.length > 0) {
    const lastLayer = layers.at(-1)?.item;
    if (lastLayer && lastLayer.toDepth < maxDepth) {
      return createGapLayer(
        lastLayer.toDepth,
        maxDepth,
        lastLayer.stratigraphyId,
        isLithology(lastLayer) ? (lastLayer.isUnconsolidated ?? true) : undefined,
      );
    }
  }
  return undefined;
};

const mergeAdjacentGaps = (layers: BaseLayerChangeTracker[]): BaseLayerChangeTracker[] => {
  const mergedLayers: BaseLayerChangeTracker[] = [];
  for (const current of layers) {
    const prev = mergedLayers.at(-1);
    if (prev?.item.isGap && current.item.isGap && mergedLayers.at(-1)?.item.toDepth === current.item.fromDepth) {
      prev.item.toDepth = current.item.toDepth;
    } else {
      mergedLayers.push(current);
    }
  }
  return mergedLayers;
};

export const getLayersWithGaps = (
  layers: BaseLayerChangeTracker[],
  minDepth: number,
  maxDepth: number,
): BaseLayerChangeTracker[] => {
  const sortedLayers = [...layers].sort((a, b) => a.item.fromDepth - b.item.fromDepth);
  const resultLayers: BaseLayerChangeTracker[] = [];

  // If layers is empty but minDepth and maxDepth are provided, return a single gap covering the full range
  const fullRangeGap = checkForFullRangeGap(sortedLayers, minDepth, maxDepth);
  if (fullRangeGap) return [fullRangeGap];

  // Add gap at start if minDepth is less than the first layer's fromDepth
  const startGap = checkForStartGap(sortedLayers, minDepth);
  if (startGap) resultLayers.push(startGap);

  // Map through layers and add gap where necessary
  for (let index = 0; index < sortedLayers.length; index++) {
    const current = sortedLayers[index];
    const prev = index > 0 ? sortedLayers[index - 1] : undefined;
    const gapBetween = checkForGapBetween(current, prev);
    if (gapBetween) resultLayers.push(gapBetween);

    resultLayers.push({
      item: { ...current.item, isGap: current.item.isGap ?? false },
      hasChanges: current.hasChanges ?? false,
    });
  }

  // Add gap at end if maxDepth is greater than the last layer's toDepth
  const endGap = checkForEndGap(sortedLayers, maxDepth);
  if (endGap) resultLayers.push(endGap);

  return mergeAdjacentGaps(resultLayers);
};

export interface BaseLayerChangeTracker {
  item: BaseLayer;
  hasChanges: boolean;
}

export interface LithologyDescription {
  id: number;
  lithologyId: number;
  lithology?: Lithology;
  isFirst: boolean;
  colorPrimaryId?: number | null;
  colorPrimary?: Codelist;
  colorSecondaryId?: number | null;
  colorSecondary?: Codelist;
  lithologyUnconMainId?: number | null;
  lithologyUnconMain?: Codelist;
  lithologyUncon2Id?: number | null;
  lithologyUncon2?: Codelist;
  lithologyUncon3Id?: number | null;
  lithologyUncon3?: Codelist;
  lithologyUncon4Id?: number | null;
  lithologyUncon4?: Codelist;
  lithologyUncon5Id?: number | null;
  lithologyUncon5?: Codelist;
  lithologyUncon6Id?: number | null;
  lithologyUncon6?: Codelist;
  componentUnconOrganicCodelistIds?: number[];
  componentUnconOrganicCodelists?: Codelist[];
  componentUnconDebrisCodelistIds?: number[];
  componentUnconDebrisCodelists?: Codelist[];
  grainShapeCodelistIds?: number[];
  grainShapeCodelists?: Codelist[];
  grainAngularityCodelistIds?: number[];
  grainAngularityCodelists?: Codelist[];
  hasStriae?: boolean;
  lithologyUnconDebrisCodelistIds?: number[];
  lithologyUnconDebrisCodelists?: Codelist[];
  lithologyConId?: number | null;
  lithologyCon?: Codelist;
  componentConParticleCodelistIds?: number[];
  componentConParticleCodelists?: Codelist[];
  componentConMineralCodelistIds?: number[];
  componentConMineralCodelists?: Codelist[];
  grainSizeId?: number | null;
  grainSize?: Codelist;
  grainAngularityId?: number | null;
  grainAngularity?: Codelist;
  gradationId?: number | null;
  gradation?: Codelist;
  cementationId?: number | null;
  cementation?: Codelist;
  structureSynGenCodelistIds?: number[];
  structureSynGenCodelists?: Codelist[];
  structurePostGenCodelistIds?: number[];
  structurePostGenCodelists?: Codelist[];
}

export interface Lithology extends BaseLayer {
  isUnconsolidated: boolean;
  hasBedding: boolean;
  share?: number;
  shareInverse?: number;
  lithologyDescriptions?: LithologyDescription[];
  alterationDegreeId?: number | null;
  alterationDegree?: Codelist;
  notes?: string;
  compactnessId?: number | null;
  compactness?: Codelist;
  cohesionId?: number | null;
  cohesion?: Codelist;
  humidityId?: number | null;
  humidity?: Codelist;
  consistencyId?: number | null;
  consistency?: Codelist;
  plasticityId?: number | null;
  plasticity?: Codelist;
  uscsTypeCodelistIds?: number[];
  uscsTypeCodelists?: Codelist[];
  uscsDeterminationId?: number | null;
  uscsDetermination?: Codelist;
  rockConditionCodelistIds?: number[];
  rockConditionCodelists?: Codelist[];
  textureMetaCodelistIds?: number[];
  textureMetaCodelists?: Codelist[];
}

export interface LayerDepth {
  fromDepth: number;
  toDepth: number;
  lithologyId: number;
  hasFromDepthError?: boolean;
  hasToDepthError?: boolean;
}

export interface LithologyEditForm {
  lithologyId: number;
  formMethods: UseFormReturn<Lithology>;
}

export interface LithologyDescriptionEditForm extends LithologyEditForm {
  isFirst: boolean;
  hasBedding?: boolean;
}

const lithologyController = "lithology";

export const fetchLithologiesByStratigraphyId = async (stratigraphyId: number): Promise<Lithology[]> =>
  await fetchApiV2Legacy(`lithology?stratigraphyId=${stratigraphyId}`, "GET");

export const lithologyQueryKey = "lithologies";

export const useLithologies = (stratigraphyId?: number): UseQueryResult<Lithology[]> =>
  useQuery({
    queryKey: [lithologyQueryKey, stratigraphyId],
    queryFn: async () => {
      return await fetchLithologiesByStratigraphyId(stratigraphyId!);
    },
    enabled: !!stratigraphyId,
  });

export const useLithologyMutations = () => {
  const queryClient = useQueryClient();
  const resetTabStatus = useResetTabStatus(["lithology"]);

  const useAddLithology = useMutation({
    mutationFn: (lithology: Lithology) => {
      return fetchApiV2WithApiError(`${lithologyController}`, "POST", lithology);
    },
    onSuccess: () => {
      resetTabStatus();
      queryClient.invalidateQueries({ queryKey: [lithologyQueryKey] });
    },
  });

  const useUpdateLithology = useMutation({
    mutationFn: (lithology: Lithology) => {
      delete lithology.createdBy;
      delete lithology.updatedBy;
      delete lithology.stratigraphy;

      return fetchApiV2WithApiError(`${lithologyController}`, "PUT", lithology);
    },
    onMutate: async (updatedLithology: Lithology) => {
      await queryClient.cancelQueries({ queryKey: [lithologyQueryKey] });
      const previousLithologies = queryClient.getQueryData<Lithology[]>([lithologyQueryKey]);
      queryClient.setQueryData<Lithology[]>([lithologyQueryKey], old =>
        old ? old.map(l => (l.id === updatedLithology.id ? { ...l, ...updatedLithology } : l)) : [],
      );
      return { previousLithologies };
    },
    onError: (err, updatedLithology, context) => {
      if (context?.previousLithologies) {
        queryClient.setQueryData([lithologyQueryKey], context.previousLithologies);
      }
    },
    onSuccess: () => {
      resetTabStatus();
      queryClient.invalidateQueries({ queryKey: [lithologyQueryKey] });
    },
  });

  const useDeleteLithology = useMutation({
    mutationFn: (lithology: Lithology) => {
      return fetchApiV2WithApiError(`${lithologyController}?id=${lithology.id}`, "DELETE");
    },
    onMutate: async (deletedLithology: Lithology) => {
      await queryClient.cancelQueries({ queryKey: [lithologyQueryKey] });
      const previousLithologies = queryClient.getQueryData<Lithology[]>([lithologyQueryKey]);
      queryClient.setQueryData<Lithology[]>([lithologyQueryKey], old =>
        old ? old.filter(l => l.id !== deletedLithology.id) : [],
      );
      return { previousLithologies };
    },
    onError: (err, deletedLithology, context) => {
      if (context?.previousLithologies) {
        queryClient.setQueryData([lithologyQueryKey], context.previousLithologies);
      }
    },
    onSuccess: () => {
      resetTabStatus();
      queryClient.invalidateQueries({ queryKey: [lithologyQueryKey] });
    },
  });

  return { add: useAddLithology, update: useUpdateLithology, delete: useDeleteLithology };
};
