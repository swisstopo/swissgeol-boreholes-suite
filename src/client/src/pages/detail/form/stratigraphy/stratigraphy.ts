import { UseFormReturn } from "react-hook-form";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { boreholeQueryKey } from "../../../../api/borehole.ts";
import { ExtractionBoundingBox } from "../../../../api/dataextractionInterfaces.ts";
import { fetchApiV2WithApiError } from "../../../../api/fetchApiV2.ts";
import {
  ChronostratigraphyLayer,
  FaciesDescription as GeneratedFaciesDescription,
  LithologicalDescription as GeneratedLithologicalDescription,
  Lithology as GeneratedLithology,
  LithostratigraphyLayer,
  Stratigraphy,
  User,
} from "../../../../api/generated";
import { NullableDateString } from "../../../../api/unionTypes.ts";
import { useResetTabStatus } from "../../../../hooks/useResetTabStatus.ts";

export type DescriptionKind = "lithological" | "facies";

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

export type Lithology = BaseLayer &
  Omit<GeneratedLithology, keyof BaseLayer> & {
    // Kept required (the generated model has it optional) because the lithology form always tracks a
    // consolidation state — null means "unspecified".
    isUnconsolidated: boolean | null;
    // Client-only mirror of `share` for the second bedding description's input (100 - share).
    shareInverse?: number;
  };

export interface LithologyFormValues extends Lithology {
  lithologicalDescription?: { description?: string };
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

export type LithologicalDescription = BaseLayer & Omit<GeneratedLithologicalDescription, keyof BaseLayer>;

export interface ExtractedLithologicalDescription extends LithologicalDescription {
  startDepthBoundingBoxes: ExtractionBoundingBox[];
  endDepthBoundingBoxes: ExtractionBoundingBox[];
  descriptionBoundingBoxes: ExtractionBoundingBox[];
}

export type FaciesDescription = BaseLayer & Omit<GeneratedFaciesDescription, keyof BaseLayer>;

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
  // error, which the add dialog surfaces on the name field.
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

      return fetchApiV2WithApiError<StratigraphyTabEdit[]>(stratigraphyController, "POST", payload);
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
    mutationFn: async (chronostratigraphy: ChronostratigraphyLayer) => {
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
    mutationFn: async (chronostratigraphy: ChronostratigraphyLayer) => {
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
    mutationFn: async (lithostratigraphy: LithostratigraphyLayer) => {
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
    mutationFn: async (lithostratigraphy: LithostratigraphyLayer) => {
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
