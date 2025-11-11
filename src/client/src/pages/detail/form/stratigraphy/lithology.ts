import { UseFormReturn } from "react-hook-form";
import { useMutation, useQuery, useQueryClient, UseQueryResult } from "@tanstack/react-query";
import { fetchApiV2Legacy, fetchApiV2WithApiError } from "../../../../api/fetchApiV2.ts";
import { BaseLayer } from "../../../../api/stratigraphy.ts";
import { Codelist } from "../../../../components/codelist.ts";
import { useResetTabStatus } from "../../../../hooks/useResetTabStatus.ts";

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

interface MutationContext {
  previousLithologies?: Lithology[];
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

export const useLithologyMutations = (skipInvalidation = false) => {
  const queryClient = useQueryClient();
  const resetTabStatus = useResetTabStatus(["lithology"]);

  const getLithologiesSnapshot = async (lithologyId: number) => {
    await queryClient.cancelQueries({ queryKey: [lithologyQueryKey, lithologyId] });
    return queryClient.getQueryData<Lithology[]>([lithologyQueryKey, lithologyId]);
  };

  const commonOnSuccess = () => {
    if (!skipInvalidation) {
      resetTabStatus();
      queryClient.invalidateQueries({ queryKey: [lithologyQueryKey] });
    }
  };

  const commonOnError = (lithology: Lithology, context?: MutationContext) => {
    if (context?.previousLithologies) {
      queryClient.setQueryData([lithologyQueryKey, lithology.stratigraphyId], context.previousLithologies);
    }
  };

  // Use to manually invalidate queries after awaiting promises in batch updates, use with skipInvalidation
  // Todo: use batch updates methods for lithologies
  const invalidateQueries = () => {
    resetTabStatus();
    queryClient.invalidateQueries({ queryKey: [lithologyQueryKey] });
  };

  const useAddLithology = useMutation({
    mutationFn: (lithology: Lithology) => {
      return fetchApiV2WithApiError(`${lithologyController}`, "POST", lithology);
    },
    onMutate: async (newLithology: Lithology) => {
      const previousLithologies = await getLithologiesSnapshot(newLithology.id);
      const optimisticLithology = {
        ...newLithology,
        id: Date.now(), // Temporary ID until server responds
      };
      queryClient.setQueryData<Lithology[]>([lithologyQueryKey, newLithology.stratigraphyId], old =>
        old ? [...old, optimisticLithology] : [optimisticLithology],
      );
      return { previousLithologies };
    },
    onError: (err, lithology, context) => commonOnError(lithology, context),
    onSuccess: commonOnSuccess,
  });

  const useUpdateLithology = useMutation({
    mutationFn: (lithology: Lithology) => {
      return fetchApiV2WithApiError(`${lithologyController}`, "PUT", lithology);
    },
    onMutate: async (updatedLithology: Lithology) => {
      const previousLithologies = await getLithologiesSnapshot(updatedLithology.id);
      queryClient.setQueryData<Lithology[]>([lithologyQueryKey, updatedLithology.stratigraphyId], old =>
        old ? old.map(l => (l.id === updatedLithology.id ? { ...l, ...updatedLithology } : l)) : [],
      );
      return { previousLithologies };
    },
    onError: (err, lithology, context) => commonOnError(lithology, context),
    onSuccess: commonOnSuccess,
  });

  const useDeleteLithology = useMutation({
    mutationFn: (lithology: Lithology) => {
      return fetchApiV2WithApiError(`${lithologyController}?id=${lithology.id}`, "DELETE");
    },
    onMutate: async (deletedLithology: Lithology) => {
      const previousLithologies = await getLithologiesSnapshot(deletedLithology.id);
      queryClient.setQueryData<Lithology[]>([lithologyQueryKey, deletedLithology.stratigraphyId], old =>
        old ? old.filter(l => l.id !== deletedLithology.id) : [],
      );
      return { previousLithologies };
    },
    onError: (err, lithology, context) => commonOnError(lithology, context),
    onSuccess: commonOnSuccess,
  });

  return { add: useAddLithology, update: useUpdateLithology, delete: useDeleteLithology, invalidateQueries };
};
