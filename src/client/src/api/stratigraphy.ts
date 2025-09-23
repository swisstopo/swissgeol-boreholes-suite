import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Codelist } from "../components/codelist.ts";
import { useResetTabStatus } from "../hooks/useResetTabStatus.ts";
import { User } from "./apiInterfaces.ts";
import { boreholeQueryKey, BoreholeV2 } from "./borehole.ts";
import { fetchApiV2Legacy, fetchApiV2WithApiError } from "./fetchApiV2.ts";

export interface StratigraphyLegacy {
  id: number;
  boreholeId: number;
  borehole: BoreholeV2 | null;
  isPrimary: boolean;
  date: string | null;
  created: Date | string | null;
  createdById: number | null;
  createdBy?: User;
  updated: Date | string | null;
  updatedById: number | null;
  updatedBy?: User;
  name: string;
  qualityId?: number;
  notes?: string;
  layers: Layer[];
  chronostratigraphyLayers: Chronostratigraphy[];
  lithostratigraphyLayers: Lithostratigraphy[];
}

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
  lithostratigraphies: Lithostratigraphy[];
  chronostratigraphies: Chronostratigraphy[];
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
}

export interface Layer {
  id: number;
  stratigraphyId: number;
  updatedBy?: User;
  createdBy?: User;
}

export interface Lithology {
  id: number;
  stratigraphyId: number;
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
  description: string;
}

export interface FaciesDescription extends BaseLayer {
  description: string;
  faciesId: number | null;
  facies: Codelist | null;
}

// layers
export const fetchLayerById = async (id: number): Promise<Layer> => await fetchApiV2Legacy(`layer/${id}`, "GET");

export const fetchLayersByProfileId = async (profileId: number): Promise<Layer[]> =>
  await fetchApiV2WithApiError(`layer?profileId=${profileId}`, "GET");

export const updateLayer = async (layer: Layer): Promise<Layer> => {
  // remove derived objects
  delete layer.createdBy;
  delete layer.updatedBy;
  return await fetchApiV2Legacy("layer", "PUT", layer);
};

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

// stratigraphy
const fetchStratigraphiesByBoreholeId = async (boreholeId: number): Promise<StratigraphyLegacy[]> => {
  return await fetchApiV2WithApiError(`stratigraphy?boreholeId=${boreholeId}`, "GET");
};

const createStratigraphy = async (boreholeId: number): Promise<StratigraphyLegacy> => {
  return await fetchApiV2WithApiError("stratigraphy", "POST", { boreholeId });
};

const copyStratigraphy = async (stratigraphy: StratigraphyLegacy): Promise<number> => {
  return await fetchApiV2WithApiError(`stratigraphy/copy?id=${stratigraphy.id}`, "POST");
};

const updateStratigraphy = async (stratigraphy: StratigraphyLegacy): Promise<StratigraphyLegacy> => {
  // remove derived objects
  delete stratigraphy.createdBy;
  delete stratigraphy.updatedBy;

  return await fetchApiV2WithApiError("stratigraphy", "PUT", stratigraphy);
};

const deleteStratigraphy = async (id: number): Promise<void> => {
  return await fetchApiV2WithApiError(`stratigraphy?id=${id}`, "DELETE");
};

export const addBedrock = async (id: number): Promise<void> => {
  return await fetchApiV2Legacy(`stratigraphy/addbedrock?id=${id}`, "POST");
};

export const stratigraphiesByBoreholeIdQueryKey = "stratigraphiesByBoreholeId";

export const useLegacyStratigraphiesByBoreholeId = (boreholeId?: number) =>
  useQuery({
    queryKey: [stratigraphiesByBoreholeIdQueryKey, boreholeId],
    queryFn: () => fetchStratigraphiesByBoreholeId(boreholeId!),
    enabled: !!boreholeId,
  });

export const invalidateStratigraphyQueries = (
  queryClient: ReturnType<typeof useQueryClient>,
  boreholeId: number,
  invalidateBorehole: boolean,
) => {
  queryClient.invalidateQueries({ queryKey: [stratigraphiesByBoreholeIdQueryKey, boreholeId] });
  if (invalidateBorehole) {
    queryClient.invalidateQueries({ queryKey: [boreholeQueryKey, boreholeId] });
  }
};

const stratigraphyController = "stratigraphyv";

export const useStratigraphiesByBoreholeId = (boreholeId?: number) =>
  useQuery({
    queryKey: [stratigraphiesByBoreholeIdQueryKey, boreholeId],
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

export const useLegacyStratigraphyMutations = () => {
  const queryClient = useQueryClient();
  const resetTabStatus = useResetTabStatus(["lithology", "lithostratigraphy", "chronostratigraphy"]);

  const useAddStratigraphy = useMutation({
    mutationFn: async (boreholeId: number) => {
      return await createStratigraphy(boreholeId);
    },
    onSuccess: addedStratigraphy => {
      resetTabStatus();
      invalidateStratigraphyQueries(queryClient, addedStratigraphy.boreholeId, true);
    },
  });

  const useCopyStratigraphy = useMutation({
    mutationFn: async (stratigraphy: StratigraphyLegacy) => {
      return await copyStratigraphy(stratigraphy);
    },
    onSuccess: (_data, originalStratigraphy) => {
      resetTabStatus();
      invalidateStratigraphyQueries(queryClient, originalStratigraphy.boreholeId, true);
    },
  });

  const useUpdateStratigraphy = useMutation({
    mutationFn: async (stratigraphy: StratigraphyLegacy) => {
      return await updateStratigraphy(stratigraphy);
    },
    onSuccess: updatedStratigraphy => {
      resetTabStatus();
      invalidateStratigraphyQueries(queryClient, updatedStratigraphy.boreholeId, false);
    },
  });

  const useDeleteStratigraphy = useMutation({
    mutationFn: async (stratigraphy: StratigraphyLegacy) => {
      return await deleteStratigraphy(stratigraphy.id);
    },
    onSuccess: (_data, stratigraphy) => {
      resetTabStatus();
      invalidateStratigraphyQueries(queryClient, stratigraphy.boreholeId, true);
    },
  });

  return {
    add: useAddStratigraphy,
    copy: useCopyStratigraphy,
    update: useUpdateStratigraphy,
    delete: useDeleteStratigraphy,
  };
};

export const layerQueryKey = "layers";

export const useLayers = (profileId?: number) =>
  useQuery({
    queryKey: [layerQueryKey, profileId],
    queryFn: () => fetchLayersByProfileId(profileId!),
    enabled: !!profileId,
  });

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
