import { useMutation, useQuery, useQueryClient, UseQueryResult } from "@tanstack/react-query";
import { fetchApiV2Legacy, fetchApiV2WithApiError } from "../../../../api/fetchApiV2.ts";
import { BaseLayer } from "../../../../api/stratigraphy.ts";
import { Codelist } from "../../../../components/codelist.ts";
import { useResetTabStatus } from "../../../../hooks/useResetTabStatus.ts";

export interface LithologyDescription {
  id: number;
  lithologyId: number;
  lithology: Lithology;
  isFirst: boolean;
  colorPrimaryId: number | null;
  colorPrimary: Codelist | null;
  colorSecondaryId: number | null;
  colorSecondary: Codelist | null;
  lithologyUnconMainId: number | null;
  lithologyUnconMain: Codelist | null;
  lithologyUncon2Id: number | null;
  lithologyUncon2: Codelist | null;
  lithologyUncon3Id: number | null;
  lithologyUncon3: Codelist | null;
  lithologyUncon4Id: number | null;
  lithologyUncon4: Codelist | null;
  lithologyUncon5Id: number | null;
  lithologyUncon5: Codelist | null;
  lithologyUncon6Id: number | null;
  lithologyUncon6: Codelist | null;
  componentUnconOrganicCodelistIds: number[];
  componentUnconOrganicCodelists: Codelist[];
  componentUnconDebrisCodelistIds: number[];
  componentUnconDebrisCodelists: Codelist[];
  grainShapeCodelistIds: Codelist[];
  grainShapeCodelists: Codelist[];
  grainAngularityCodelistIds: number[];
  grainAngularityCodelists: Codelist[];
  hasStriae: boolean;
  lithologyUnconDebrisCodelistIds: number[];
  lithologyUnconDebrisCodelists: Codelist[];
  lithologyConId: number | null;
  lithologyCon: Codelist | null;
  componentConParticleCodelistIds: number[];
  componentConParticleCodelists: Codelist[];
  componentConMineralCodelistIds: number[];
  componentConMineralCodelists: Codelist[];
  grainSizeId: number | null;
  grainSize: Codelist | null;
  grainAngularityId: number | null;
  grainAngularity: Codelist | null;
  gradationId: number | null;
  gradation: Codelist | null;
  cementationId: number | null;
  cementation: Codelist | null;
  structureSynGenCodelistIds: number[];
  structureSynGenCodelists: Codelist[];
  structurePostGenCodelistIds: number[];
  structurePostGenCodelists: Codelist[];
}

export interface Lithology extends BaseLayer {
  isUnconsolidated: boolean;
  hasBedding: boolean;
  share: number | null;
  lithologyDescriptions: LithologyDescription[];
  alterationDegreeId: number | null;
  alterationDegree: Codelist | null;
  notes: string | null;
  compactnessId: number | null;
  compactness: Codelist | null;
  cohesionId: number | null;
  cohesion: Codelist | null;
  humidityId: number | null;
  humidity: Codelist | null;
  consistencyId: number | null;
  consistency: Codelist | null;
  plasticityId: number | null;
  plasticity: Codelist | null;
  uscsTypeCodelistIds: number[];
  uscsTypeCodelists: Codelist[];
  uscsDeterminationId: number | null;
  uscsDetermination: Codelist | null;
  rockConditionCodelistIds: number[];
  rockConditionCodelists: Codelist[];
  textureMetaCodelistIds: number[];
  textureMetaCodelists: Codelist[];
}

export interface LayerDepth {
  fromDepth: number;
  toDepth: number;
  lithologyId: number;
}

const lithologyController = "lithology";

export const fetchLithologiesByStratigraphyId = async (stratigraphyId: number): Promise<Lithology[]> =>
  await fetchApiV2Legacy(`lithology?stratigraphyId=${stratigraphyId}`, "GET");

export const lithologyQueryKey = "lithologies";

export const useLithologies = (stratigraphyId?: number): UseQueryResult<Lithology[]> =>
  useQuery({
    queryKey: [lithologyQueryKey, stratigraphyId],
    queryFn: async () => {
      try {
        const result = await fetchLithologiesByStratigraphyId(stratigraphyId!);
        return Array.isArray(result) ? result : [];
      } catch {
        return [];
      }
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
