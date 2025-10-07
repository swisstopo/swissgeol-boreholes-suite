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
  all.forEach(arr => {
    arr.forEach(item => {
      if (minDepth === undefined || item.fromDepth < minDepth) minDepth = item.fromDepth;
      if (maxDepth === undefined || item.toDepth > maxDepth) maxDepth = item.toDepth;
    });
  });

  return {
    minDepth: minDepth === undefined ? 0 : minDepth,
    maxDepth: maxDepth === undefined ? 0 : maxDepth,
  };
};

export const getLayersWithGaps = (
  layers: BaseLayerChangeTracker[],
  minDepth: number,
  maxDepth: number,
): BaseLayerChangeTracker[] => {
  const sortedLayers = [...layers].sort((a, b) => a.item.fromDepth - b.item.fromDepth);
  const resultLayers: BaseLayerChangeTracker[] = [];

  // Helper to check if a layer is Lithology (by property presence)
  const isLithology = (layer: BaseLayer): layer is Lithology => {
    return "hasBedding" in layer && "isUnconsolidated" in layer;
  };

  // Add gap at start if needed
  if (sortedLayers.length > 0) {
    const firstLayer = sortedLayers[0];
    if (minDepth < firstLayer.item.fromDepth) {
      const gapLayer: BaseLayer = {
        id: 0,
        fromDepth: minDepth,
        toDepth: firstLayer.item.fromDepth,
        isGap: true,
        stratigraphyId: firstLayer.item.stratigraphyId,
        ...(isLithology(firstLayer.item) && { hasBedding: false, isUnconsolidated: true }),
      };
      resultLayers.push({ item: gapLayer, hasChanges: false });
    }
  }

  let lastDepth = 0;
  sortedLayers.forEach((layer, index) => {
    // If there's a gap between this layer and the previous depth, add a gap filler
    if (layer.item.fromDepth > lastDepth && index > 0) {
      const prev = sortedLayers[index - 1].item;
      const gapLayer: BaseLayer = {
        id: 0,
        fromDepth: lastDepth,
        toDepth: layer.item.fromDepth,
        isGap: true,
        stratigraphyId: layer.item.stratigraphyId,
        ...(isLithology(prev) && { hasBedding: false, isUnconsolidated: prev.isUnconsolidated ?? true }),
      };
      resultLayers.push({ item: gapLayer, hasChanges: false });
    }

    resultLayers.push({
      item: { ...layer.item, isGap: layer.item.isGap ?? false },
      hasChanges: layer.hasChanges ?? false,
    });
    lastDepth = layer.item.toDepth;
  });

  // Add gap at end if needed
  if (sortedLayers.length > 0) {
    const lastLayer = sortedLayers[sortedLayers.length - 1];
    if (lastLayer.item.toDepth < maxDepth) {
      const gapLayer: BaseLayer = {
        id: 0,
        fromDepth: lastLayer.item.toDepth,
        toDepth: maxDepth,
        isGap: true,
        stratigraphyId: lastLayer.item.stratigraphyId,
        ...(isLithology(lastLayer.item) && {
          hasBedding: false,
          isUnconsolidated: lastLayer.item.isUnconsolidated ?? true,
        }),
      };
      resultLayers.push({ item: gapLayer, hasChanges: false });
    }
  }

  // If layers is empty but minDepth and maxDepth are provided, return a single gap covering the full range
  if (sortedLayers.length === 0 && minDepth < maxDepth) {
    resultLayers.push({
      item: {
        id: 0,
        fromDepth: minDepth,
        toDepth: maxDepth,
        isGap: true,
        stratigraphyId: 0,
      },
      hasChanges: false,
    });
  }

  // Merge adjacent gap resultLayers
  const mergedLayers: BaseLayerChangeTracker[] = [];
  for (let i = 0; i < resultLayers.length; i++) {
    const prev = mergedLayers.length > 0 ? mergedLayers[mergedLayers.length - 1] : undefined;
    const current = resultLayers[i];
    if (
      prev?.item.isGap &&
      current.item.isGap &&
      mergedLayers[mergedLayers.length - 1].item.toDepth === current.item.fromDepth
    ) {
      prev.item.toDepth = current.item.toDepth;
    } else {
      mergedLayers.push(current);
    }
  }
  return mergedLayers;
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
