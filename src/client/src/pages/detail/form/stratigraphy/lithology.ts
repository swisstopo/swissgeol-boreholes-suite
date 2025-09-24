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
  colorPrimaryId?: number;
  colorPrimary?: Codelist;
  colorSecondaryId?: number;
  colorSecondary?: Codelist;
  lithologyUnconMainId?: number;
  lithologyUnconMain?: Codelist;
  lithologyUncon2Id?: number;
  lithologyUncon2?: Codelist;
  lithologyUncon3Id?: number;
  lithologyUncon3?: Codelist;
  lithologyUncon4Id?: number;
  lithologyUncon4?: Codelist;
  lithologyUncon5Id?: number;
  lithologyUncon5?: Codelist;
  lithologyUncon6Id?: number;
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
  lithologyConId?: number;
  lithologyCon?: Codelist;
  componentConParticleCodelistIds?: number[];
  componentConParticleCodelists?: Codelist[];
  componentConMineralCodelistIds?: number[];
  componentConMineralCodelists?: Codelist[];
  grainSizeId?: number;
  grainSize?: Codelist;
  grainAngularityId?: number;
  grainAngularity?: Codelist;
  gradationId?: number;
  gradation?: Codelist;
  cementationId?: number;
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
  alterationDegreeId?: number;
  alterationDegree?: Codelist;
  notes?: string;
  compactnessId?: number;
  compactness?: Codelist;
  cohesionId?: number;
  cohesion?: Codelist;
  humidityId?: number;
  humidity?: Codelist;
  consistencyId?: number;
  consistency?: Codelist;
  plasticityId?: number;
  plasticity?: Codelist;
  uscsTypeCodelistIds?: number[];
  uscsTypeCodelists?: Codelist[];
  uscsDeterminationId?: number;
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
    mutationFn: async (lithology: Lithology) => {
      return await fetchApiV2WithApiError(`${lithologyController}`, "POST", lithology);
    },
    onSuccess: () => {
      resetTabStatus();
      queryClient.invalidateQueries({ queryKey: [lithologyQueryKey] });
    },
  });

  const useUpdateLithology = useMutation({
    mutationFn: async (lithology: Lithology) => {
      delete lithology.createdBy;
      delete lithology.updatedBy;
      delete lithology.stratigraphy;

      return await fetchApiV2WithApiError(`${lithologyController}`, "PUT", lithology);
    },
    onSuccess: () => {
      resetTabStatus();
      queryClient.invalidateQueries({ queryKey: [lithologyQueryKey] });
    },
  });

  const useDeleteLithology = useMutation({
    mutationFn: async (lithology: Lithology) => {
      return await fetchApiV2WithApiError(`${lithologyController}?id=${lithology.id}`, "DELETE");
    },
    onSuccess: () => {
      resetTabStatus();
      queryClient.invalidateQueries({ queryKey: [lithologyQueryKey] });
    },
  });

  return { add: useAddLithology, update: useUpdateLithology, delete: useDeleteLithology };
};
