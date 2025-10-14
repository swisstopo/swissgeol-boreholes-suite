import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Codelist } from "../components/codelist.ts";
import { useResetTabStatus } from "../hooks/useResetTabStatus.ts";
import { Lithology } from "../pages/detail/form/stratigraphy/lithology.ts";
import { ExtractionBoundingBox } from "../pages/detail/labeling/labelingInterfaces.tsx";
import { User } from "./apiInterfaces.ts";
import { boreholeQueryKey, BoreholeV2 } from "./borehole.ts";
import { fetchApiV2WithApiError } from "./fetchApiV2.ts";

export interface Stratigraphy {
  id: number;
  boreholeId: number;
  borehole: BoreholeV2 | null;
  name: string | null;
  date: string | null;
  isPrimary: boolean;
  created: Date | string | null;
  createdById: number | null;
  createdBy?: User;
  updated: Date | string | null;
  updatedById: number | null;
  updatedBy?: User;
  lithologies: Lithology[];
  lithostratigraphyLayers: Lithostratigraphy[];
  chronostratigraphyLayers: Chronostratigraphy[];
}

export interface BaseLayer {
  id: number;
  fromDepth: number;
  toDepth: number;
  stratigraphyId: number;
  stratigraphy?: Stratigraphy;
  created?: Date | string | null;
  createdById?: number | null;
  createdBy?: User;
  updated?: Date | string | null;
  updatedById?: number | null;
  updatedBy?: User;
  isGap?: boolean;
  isUnconsolidated?: boolean;
}

export interface MinimalLayer {
  id: number;
  fromDepth?: number;
  toDepth?: number;
  stratigraphyId: number;
  isGap?: boolean;
  isUnconsolidated?: boolean;
  hasBedding?: boolean;
}

export interface Chronostratigraphy {
  id: number;
  stratigraphyId: number;
}

export interface Lithostratigraphy {
  id: number;
  stratigraphyId: number;
}

export interface LithologicalDescription extends BaseLayer {
  description?: string;
}

export interface FaciesDescription extends BaseLayer {
  description?: string;
  faciesId?: number | null;
  facies?: Codelist | null;
}

export interface ExtractedLithologicalDescription extends LithologicalDescription {
  startDepthBoundingBoxes: ExtractionBoundingBox[];
  endDepthBoundingBoxes: ExtractionBoundingBox[];
  descriptionBoundingBoxes: ExtractionBoundingBox[];
}

// lithological descriptions
export const fetchLithologicalDescriptionsByProfileId = async (
  profileId: number,
): Promise<LithologicalDescription[]> => {
  return await fetchApiV2WithApiError(`lithologicaldescription?stratigraphyId=${profileId}`, "GET");
};

export const addLithologicalDescription = async (
  lithologicalDescription: LithologicalDescription,
): Promise<LithologicalDescription> => {
  return await fetchApiV2WithApiError("lithologicaldescription", "POST", lithologicalDescription);
};

export const updateLithologicalDescription = async (
  lithologicalDescription: LithologicalDescription,
): Promise<LithologicalDescription> => {
  return await fetchApiV2WithApiError("lithologicaldescription", "PUT", lithologicalDescription);
};

export const deleteLithologicalDescription = async (id: number): Promise<void> => {
  return await fetchApiV2WithApiError(`lithologicaldescription?id=${id}`, "DELETE");
};

// facies descriptions
export const fetchFaciesDescriptionsByProfileId = async (profileId: number): Promise<FaciesDescription[]> => {
  return await fetchApiV2WithApiError(`faciesdescription?stratigraphyId=${profileId}`, "GET");
};

export const addFaciesDescription = async (faciesDescription: FaciesDescription): Promise<FaciesDescription> => {
  return await fetchApiV2WithApiError("faciesdescription", "POST", faciesDescription);
};

export const updateFaciesDescription = async (faciesDescription: FaciesDescription): Promise<FaciesDescription> => {
  return await fetchApiV2WithApiError("faciesdescription", "PUT", faciesDescription);
};

export const deleteFaciesDescription = async (id: number): Promise<void> => {
  return await fetchApiV2WithApiError(`faciesdescription?id=${id}`, "DELETE");
};

export const stratigraphiesQueryKey = "stratigraphies";

export const invalidateStratigraphyQueries = (
  queryClient: ReturnType<typeof useQueryClient>,
  boreholeId: number,
  invalidateBorehole: boolean,
) => {
  queryClient.invalidateQueries({ queryKey: [stratigraphiesQueryKey, boreholeId] });
  if (invalidateBorehole) {
    queryClient.invalidateQueries({ queryKey: [boreholeQueryKey, boreholeId] });
  }
};

const stratigraphyController = "stratigraphyv";

export const useStratigraphiesByBoreholeId = (boreholeId?: number) =>
  useQuery({
    queryKey: [stratigraphiesQueryKey, boreholeId],
    queryFn: async () => {
      return await fetchApiV2WithApiError(`${stratigraphyController}?boreholeId=${boreholeId!}`, "GET");
    },
    enabled: !!boreholeId,
  });

export const useStratigraphyMutations = () => {
  const queryClient = useQueryClient();
  const resetTabStatus = useResetTabStatus(["lithology", "lithostratigraphy", "chronostratigraphy"]);

  const useAddStratigraphy = useMutation({
    mutationFn: async (stratigraphy: Stratigraphy) => {
      return await fetchApiV2WithApiError(stratigraphyController, "POST", stratigraphy);
    },
    onSuccess: (_data, stratigraphy) => {
      resetTabStatus();
      invalidateStratigraphyQueries(queryClient, Number(stratigraphy.boreholeId), true);
    },
  });

  const useCopyStratigraphy = useMutation({
    mutationFn: async (stratigraphy: Stratigraphy) => {
      return await fetchApiV2WithApiError(`${stratigraphyController}/copy?id=${stratigraphy.id}`, "POST");
    },
    onSuccess: (_data, stratigraphy) => {
      resetTabStatus();
      invalidateStratigraphyQueries(queryClient, Number(stratigraphy.boreholeId), false);
    },
  });

  const useUpdateStratigraphy = useMutation({
    mutationFn: async (stratigraphy: Stratigraphy) => {
      // remove derived objects
      delete stratigraphy.createdBy;
      delete stratigraphy.updatedBy;

      return await fetchApiV2WithApiError(stratigraphyController, "PUT", stratigraphy);
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
    update: useUpdateStratigraphy,
    delete: useDeleteStratigraphy,
  };
};

export const lithologicalDescriptionQueryKey = "lithoDesc";

export const useLithologicalDescription = (stratigraphyId?: number) =>
  useQuery({
    queryKey: [lithologicalDescriptionQueryKey, stratigraphyId],
    queryFn: async () => {
      return await fetchLithologicalDescriptionsByProfileId(stratigraphyId!);
    },
    enabled: !!stratigraphyId,
  });

export const useLithologicalDescriptionMutations = () => {
  const queryClient = useQueryClient();
  const resetTabStatus = useResetTabStatus(["lithology"]);

  const useAddLithologicalDescription = useMutation({
    mutationFn: async (lithologicalDescription: LithologicalDescription) => {
      return addLithologicalDescription(lithologicalDescription);
    },
    onSuccess: () => {
      resetTabStatus();
      queryClient.invalidateQueries({
        queryKey: [lithologicalDescriptionQueryKey],
      });
    },
  });
  const useUpdateLithologicalDescription = useMutation({
    mutationFn: async (lithologicalDescription: LithologicalDescription) => {
      return updateLithologicalDescription(lithologicalDescription);
    },
    onSuccess: () => {
      resetTabStatus();
      queryClient.invalidateQueries({
        queryKey: [lithologicalDescriptionQueryKey],
      });
    },
  });
  const useDeleteLithologicalDescription = useMutation({
    mutationFn: async (lithologicalDescription: LithologicalDescription) => {
      return deleteLithologicalDescription(lithologicalDescription.id);
    },
    onSuccess: () => {
      resetTabStatus();
      queryClient.invalidateQueries({
        queryKey: [lithologicalDescriptionQueryKey],
      });
    },
  });

  return {
    add: useAddLithologicalDescription,
    update: useUpdateLithologicalDescription,
    delete: useDeleteLithologicalDescription,
  };
};

export const faciesDescriptionQueryKey = "faciesDesc";

export const useFaciesDescription = (stratigraphyId?: number) =>
  useQuery({
    queryKey: [faciesDescriptionQueryKey, stratigraphyId],
    queryFn: async () => {
      return await fetchFaciesDescriptionsByProfileId(stratigraphyId!);
    },
    enabled: !!stratigraphyId,
  });

export const useFaciesDescriptionMutations = () => {
  const queryClient = useQueryClient();
  const resetTabStatus = useResetTabStatus(["lithology"]);

  const useAddFaciesDescription = useMutation({
    mutationFn: async (faciesDescription: FaciesDescription) => {
      return addFaciesDescription(faciesDescription);
    },
    onSuccess: () => {
      resetTabStatus();
      queryClient.invalidateQueries({
        queryKey: [faciesDescriptionQueryKey],
      });
    },
  });

  const useUpdateFaciesDescription = useMutation({
    mutationFn: async (faciesDescription: FaciesDescription) => {
      return updateFaciesDescription(faciesDescription);
    },
    onSuccess: () => {
      resetTabStatus();
      queryClient.invalidateQueries({
        queryKey: [faciesDescriptionQueryKey],
      });
    },
  });

  const useDeleteFaciesDescription = useMutation({
    mutationFn: async (faciesDescription: FaciesDescription) => {
      return deleteFaciesDescription(faciesDescription.id);
    },
    onSuccess: () => {
      resetTabStatus();
      queryClient.invalidateQueries({
        queryKey: [faciesDescriptionQueryKey],
      });
    },
  });

  return {
    add: useAddFaciesDescription,
    update: useUpdateFaciesDescription,
    delete: useDeleteFaciesDescription,
  };
};

export const chronostratigraphiesQueryKey = "chronostratigraphies";

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
    },
  });

  return {
    add: useAddChronostratigraphy,
    update: useUpdateChronostratigraphy,
    delete: useDeleteChronostratigraphy,
  };
};

export const lithostratigraphiesQueryKey = "lithostratigraphies";

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
    },
  });

  return {
    add: useAddLithostratigraphy,
    update: useUpdateLithostratigraphy,
    delete: useDeleteLithostratigraphy,
  };
};
