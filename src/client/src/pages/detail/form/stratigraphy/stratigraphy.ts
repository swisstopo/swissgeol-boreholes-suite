import { UseFormReturn } from "react-hook-form";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { NullableDateString, User } from "../../../../api/apiInterfaces.ts";
import { boreholeQueryKey, BoreholeV2 } from "../../../../api/borehole.ts";
import { ExtractionBoundingBox } from "../../../../api/dataextractionInterfaces.ts";
import { fetchApiV2WithApiError } from "../../../../api/fetchApiV2.ts";
import { Codelist } from "../../../../components/codelist.ts";
import { useResetTabStatus } from "../../../../hooks/useResetTabStatus.ts";

export interface Stratigraphy {
  id: number;
  boreholeId: number;
  borehole: BoreholeV2 | null;
  name: string | null;
  date: string | null;
  isPrimary: boolean;
  created: NullableDateString;
  createdById: number | null;
  createdBy?: User;
  updated: NullableDateString;
  updatedById: number | null;
  updatedBy?: User;
  lithologies: Lithology[] | null;
  lithostratigraphyLayers: Lithostratigraphy[] | null;
  chronostratigraphyLayers: Chronostratigraphy[] | null;
}

export interface BaseLayer {
  id: number;
  fromDepth: number | null;
  toDepth: number | null;
  stratigraphyId: number;
  stratigraphy?: Stratigraphy;
  created?: NullableDateString;
  createdById?: number | null;
  createdBy?: User;
  updated?: NullableDateString;
  updatedById?: number | null;
  updatedBy?: User;
  isGap?: boolean;
  isUnconsolidated?: boolean | null;
  depthIds?: string[];
  isAutoCorrected?: boolean;
}

export interface DepthLayer {
  id: string;
  fromDepth: number | null;
  toDepth: number | null;
  hasFromDepthError?: boolean;
  hasToDepthError?: boolean;
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
  isUnconsolidated: boolean | null;
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

export interface LithologicalDescription extends BaseLayer {
  description?: string;
}

export interface ExtractedLithologicalDescription extends LithologicalDescription {
  startDepthBoundingBoxes: ExtractionBoundingBox[];
  endDepthBoundingBoxes: ExtractionBoundingBox[];
  descriptionBoundingBoxes: ExtractionBoundingBox[];
}

export interface FaciesDescription extends BaseLayer {
  description?: string;
  faciesId?: number | null;
  facies?: Codelist | null;
}

export interface LithologyTabContents {
  lithologies: Lithology[];
  lithologicalDescriptions: LithologicalDescription[];
  faciesDescriptions: FaciesDescription[];
}

// Used both as the combined-save request payload and as the response (the server returns the saved
// stratigraphy together with the loaded lithology tab contents).
export interface StratigraphyTabEdit {
  stratigraphy: Stratigraphy;
  lithologyTab?: LithologyTabContents;
}

interface ExtractedStratigraphyInput {
  name: string;
  lithologicalDescriptions: Omit<LithologicalDescription, "id" | "stratigraphyId">[];
  lithologies: Omit<Lithology, "id" | "stratigraphyId">[];
  faciesDescriptions?: Omit<FaciesDescription, "id" | "stratigraphyId">[];
}

interface Chronostratigraphy {
  id: number;
  stratigraphyId: number;
}

interface Lithostratigraphy {
  id: number;
  stratigraphyId: number;
}

const stratigraphiesQueryKey = "stratigraphies";

const invalidateStratigraphyQueries = (
  queryClient: ReturnType<typeof useQueryClient>,
  boreholeId: number,
  invalidateBorehole: boolean,
) => {
  queryClient.invalidateQueries({ queryKey: [stratigraphiesQueryKey, boreholeId] });
  if (invalidateBorehole) {
    queryClient.invalidateQueries({ queryKey: [boreholeQueryKey, boreholeId] });
  }
};

const stratigraphyController = "stratigraphy";
const lithologyTabQueryKey = "lithologyTab";

export const useStratigraphiesByBoreholeId = (boreholeId?: number) =>
  useQuery({
    queryKey: [stratigraphiesQueryKey, boreholeId],
    queryFn: async () => {
      return await fetchApiV2WithApiError<Stratigraphy[]>(`${stratigraphyController}?boreholeId=${boreholeId!}`, "GET");
    },
    enabled: !!boreholeId,
  });

export const useStratigraphyMutations = () => {
  const queryClient = useQueryClient();
  const resetTabStatus = useResetTabStatus(["lithology", "lithostratigraphy", "chronostratigraphy"]);

  // A header-only create (no tab content). The server rejects duplicate names with a mustBeUnique
  // error (resolveNameConflicts is not set), which the add dialog surfaces on the name field.
  const useAddStratigraphy = useMutation({
    mutationFn: async (stratigraphy: Stratigraphy) => {
      const created = await fetchApiV2WithApiError<StratigraphyTabEdit[]>(stratigraphyController, "POST", [
        { stratigraphy },
      ]);
      resetTabStatus();
      await queryClient.invalidateQueries({
        queryKey: [stratigraphiesQueryKey, Number(stratigraphy.boreholeId)],
      });
      await queryClient.invalidateQueries({
        queryKey: [boreholeQueryKey, Number(stratigraphy.boreholeId)],
      });
      return created[0].stratigraphy;
    },
  });

  const useCopyStratigraphy = useMutation({
    mutationFn: async (stratigraphy: Stratigraphy) => {
      return await fetchApiV2WithApiError<number>(`${stratigraphyController}/copy?id=${stratigraphy.id}`, "POST");
    },
    onSuccess: (_data, stratigraphy) => {
      resetTabStatus();
      invalidateStratigraphyQueries(queryClient, Number(stratigraphy.boreholeId), false);
    },
  });

  const useDeleteStratigraphy = useMutation({
    mutationFn: async (stratigraphy: Stratigraphy) => {
      return await fetchApiV2WithApiError(`${stratigraphyController}?id=${stratigraphy.id}`, "DELETE");
    },
    onSuccess: (_data, stratigraphy) => {
      resetTabStatus();
      invalidateStratigraphyQueries(queryClient, Number(stratigraphy.boreholeId), true);
    },
  });

  return {
    add: useAddStratigraphy,
    copy: useCopyStratigraphy,
    delete: useDeleteStratigraphy,
  };
};

// Loads the full contents of the Lithology tab (lithologies + lithological/facies descriptions).
export const useLithologyTabContents = (stratigraphyId?: number) =>
  useQuery({
    queryKey: [lithologyTabQueryKey, stratigraphyId],
    queryFn: () =>
      fetchApiV2WithApiError<LithologyTabContents>(`${stratigraphyController}/${stratigraphyId}/lithology`, "GET"),
    enabled: !!stratigraphyId,
  });

// The single combined save for the stratigraphy detail page: persists the header and (optionally) the
// active tab's content in one request. The lithology tab passes its contents; the chrono/litho tabs
// pass only the header (lithology omitted).
export const useUpdateStratigraphyWithContents = () => {
  const queryClient = useQueryClient();
  const resetTabStatus = useResetTabStatus(["lithology", "lithostratigraphy", "chronostratigraphy"]);

  return useMutation({
    mutationFn: async (edit: StratigraphyTabEdit) => {
      const stratigraphy = { ...edit.stratigraphy };
      delete stratigraphy.createdBy;
      delete stratigraphy.updatedBy;
      return await fetchApiV2WithApiError<StratigraphyTabEdit>(stratigraphyController, "PUT", {
        ...edit,
        stratigraphy,
      });
    },
    onSuccess: response => {
      resetTabStatus();
      invalidateStratigraphyQueries(queryClient, Number(response.stratigraphy.boreholeId), true);
      queryClient.invalidateQueries({ queryKey: [lithologyTabQueryKey, response.stratigraphy.id] });
    },
  });
};

// Bulk-creates 1-n stratigraphies with their lithology contents from the extraction modal. Passes
// resolveNameConflicts so the server disambiguates the generated names by appending " (N)".
export const useAddExtractedStratigraphies = () => {
  const queryClient = useQueryClient();
  const resetTabStatus = useResetTabStatus(["lithology"]);

  return useMutation({
    mutationFn: ({
      boreholeId,
      stratigraphies,
    }: {
      boreholeId: number;
      stratigraphies: ExtractedStratigraphyInput[];
    }): Promise<StratigraphyTabEdit[]> => {
      const payload = stratigraphies.map(({ name, lithologicalDescriptions, lithologies, faciesDescriptions }) => ({
        stratigraphy: { id: 0, name, isPrimary: false, boreholeId },
        lithologyTab: {
          lithologies: lithologies.map(l => ({ ...l, id: 0, stratigraphyId: 0 })),
          lithologicalDescriptions: lithologicalDescriptions.map(d => ({ ...d, id: 0, stratigraphyId: 0 })),
          faciesDescriptions: (faciesDescriptions ?? []).map(d => ({ ...d, id: 0, stratigraphyId: 0 })),
        },
      }));

      return fetchApiV2WithApiError<StratigraphyTabEdit[]>(
        `${stratigraphyController}?resolveNameConflicts=true`,
        "POST",
        payload,
      );
    },
    onSuccess: async results => {
      if (results.length === 0) return;
      resetTabStatus();
      await queryClient.invalidateQueries({
        queryKey: [stratigraphiesQueryKey, results[0].stratigraphy.boreholeId],
      });
    },
  });
};

const chronostratigraphiesQueryKey = "chronostratigraphies";

export const useChronostratigraphies = (stratigraphyID?: number) =>
  useQuery({
    queryKey: [chronostratigraphiesQueryKey, stratigraphyID],
    queryFn: async () => {
      return await fetchApiV2WithApiError(`chronostratigraphy?stratigraphyId=${stratigraphyID}`, "GET");
    },
    enabled: !!stratigraphyID,
  });

export const useChronostratigraphyMutations = () => {
  const queryClient = useQueryClient();
  const resetTabStatus = useResetTabStatus(["chronostratigraphy"]);
  const useAddChronostratigraphy = useMutation({
    mutationFn: async (chronostratigraphy: Chronostratigraphy) => {
      return await fetchApiV2WithApiError("chronostratigraphy", "POST", chronostratigraphy);
    },
    onSuccess: () => {
      resetTabStatus();
      queryClient.invalidateQueries({
        queryKey: [chronostratigraphiesQueryKey],
      });
      queryClient.invalidateQueries({ queryKey: [boreholeQueryKey] });
    },
  });
  const useUpdateChronostratigraphy = useMutation({
    mutationFn: async (chronostratigraphy: Chronostratigraphy) => {
      return await fetchApiV2WithApiError("chronostratigraphy", "PUT", chronostratigraphy);
    },
    onSuccess: () => {
      resetTabStatus();
      queryClient.invalidateQueries({
        queryKey: [chronostratigraphiesQueryKey],
      });
      queryClient.invalidateQueries({ queryKey: [boreholeQueryKey] });
    },
  });
  const useDeleteChronostratigraphy = useMutation({
    mutationFn: async (chronostratigraphyId: number) => {
      return await fetchApiV2WithApiError(`chronostratigraphy?id=${chronostratigraphyId}`, "DELETE");
    },
    onSuccess: () => {
      resetTabStatus();
      queryClient.invalidateQueries({
        queryKey: [chronostratigraphiesQueryKey],
      });
      queryClient.invalidateQueries({ queryKey: [boreholeQueryKey] });
    },
  });

  return {
    add: useAddChronostratigraphy,
    update: useUpdateChronostratigraphy,
    delete: useDeleteChronostratigraphy,
  };
};

const lithostratigraphiesQueryKey = "lithostratigraphies";

export const useLithostratigraphies = (stratigraphyID?: number) =>
  useQuery({
    queryKey: [lithostratigraphiesQueryKey, stratigraphyID],
    queryFn: async () => {
      return await fetchApiV2WithApiError(`lithostratigraphy?stratigraphyId=${stratigraphyID}`, "GET");
    },
    enabled: !!stratigraphyID,
  });

export const useLithostratigraphyMutations = () => {
  const queryClient = useQueryClient();
  const resetTabStatus = useResetTabStatus(["lithostratigraphy"]);
  const useAddLithostratigraphy = useMutation({
    mutationFn: async (lithostratigraphy: Lithostratigraphy) => {
      return await fetchApiV2WithApiError("lithostratigraphy", "POST", lithostratigraphy);
    },
    onSuccess: () => {
      resetTabStatus();
      queryClient.invalidateQueries({
        queryKey: [lithostratigraphiesQueryKey],
      });
      queryClient.invalidateQueries({ queryKey: [boreholeQueryKey] });
    },
  });
  const useUpdateLithostratigraphy = useMutation({
    mutationFn: async (lithostratigraphy: Lithostratigraphy) => {
      return await fetchApiV2WithApiError("lithostratigraphy", "PUT", lithostratigraphy);
    },
    onSuccess: () => {
      resetTabStatus();
      queryClient.invalidateQueries({
        queryKey: [lithostratigraphiesQueryKey],
      });
      queryClient.invalidateQueries({ queryKey: [boreholeQueryKey] });
    },
  });
  const useDeleteLithostratigraphy = useMutation({
    mutationFn: async (lithostratigraphyId: number) => {
      return await fetchApiV2WithApiError(`lithostratigraphy?id=${lithostratigraphyId}`, "DELETE");
    },
    onSuccess: () => {
      resetTabStatus();
      queryClient.invalidateQueries({
        queryKey: [lithostratigraphiesQueryKey],
      });
      queryClient.invalidateQueries({ queryKey: [boreholeQueryKey] });
    },
  });

  return {
    add: useAddLithostratigraphy,
    update: useUpdateLithostratigraphy,
    delete: useDeleteLithostratigraphy,
  };
};
