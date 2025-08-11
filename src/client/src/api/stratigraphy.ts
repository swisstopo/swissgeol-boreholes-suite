import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useResetTabStatus } from "../hooks/useResetTabStatus.ts";
import { useShowAlertOnError } from "../hooks/useShowAlertOnError.tsx";
import { User } from "./apiInterfaces.ts";
import { boreholeQueryKey, BoreholeV2 } from "./borehole.ts";
import { fetchApiV2, fetchApiV2WithApiError } from "./fetchApiV2.ts";

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
  layers: Layer[] | null;
  chronostratigraphyLayers: Chronostratigraphy[] | null;
  lithostratigraphyLayers: Lithostratigraphy[] | null;
}

export interface Stratigraphy {
  id: number;
  boreholeId: number;
  borehole: BoreholeV2 | null;
  name: string;
  date: string | null;
  isPrimary: boolean;
  created: Date | string | null;
  createdById: number | null;
  createdBy?: User;
  updated: Date | string | null;
  updatedById: number | null;
  updatedBy?: User;
}

export interface Layer {
  id: number;
  stratigraphyId: number;
  updatedBy?: User;
  createdBy?: User;
}

export interface Chronostratigraphy {
  id: number;
  stratigraphyId: number;
}

export interface Lithostratigraphy {
  id: number;
  stratigraphyId: number;
}

export interface LithologicalDescription {
  id: number;
  stratigraphyId: number;
}

export interface FaciesDescription {
  id: number;
  stratigraphyId: number;
}

// layers
export const fetchLayerById = async (id: number): Promise<Layer> => await fetchApiV2(`layer/${id}`, "GET");

export const fetchLayersByProfileId = async (profileId: number): Promise<Layer[]> =>
  await fetchApiV2(`layer?profileId=${profileId}`, "GET");

export const updateLayer = async (layer: Layer): Promise<Layer> => {
  // remove derived objects
  delete layer.createdBy;
  delete layer.updatedBy;
  return await fetchApiV2("layer", "PUT", layer);
};

// lithological descriptions
export const fetchLithologicalDescriptionsByProfileId = async (
  profileId: number,
): Promise<LithologicalDescription[]> => {
  return await fetchApiV2(`lithologicaldescription?stratigraphyId=${profileId}`, "GET");
};

export const addLithologicalDescription = async (
  lithologicalDescription: LithologicalDescription,
): Promise<LithologicalDescription> => {
  return await fetchApiV2("lithologicaldescription", "POST", lithologicalDescription);
};

export const updateLithologicalDescription = async (
  lithologicalDescription: LithologicalDescription,
): Promise<LithologicalDescription> => {
  return await fetchApiV2("lithologicaldescription", "PUT", lithologicalDescription);
};

export const deleteLithologicalDescription = async (id: number): Promise<void> => {
  return await fetchApiV2(`lithologicaldescription?id=${id}`, "DELETE");
};

// facies descriptions
export const fetchFaciesDescriptionsByProfileId = async (profileId: number): Promise<FaciesDescription[]> => {
  return await fetchApiV2(`faciesdescription?stratigraphyId=${profileId}`, "GET");
};

export const addFaciesDescription = async (faciesDescription: FaciesDescription): Promise<FaciesDescription> => {
  return await fetchApiV2("faciesdescription", "POST", faciesDescription);
};

export const updateFaciesDescription = async (faciesDescription: FaciesDescription): Promise<FaciesDescription> => {
  return await fetchApiV2("faciesdescription", "PUT", faciesDescription);
};

export const deleteFaciesDescription = async (id: number): Promise<void> => {
  return await fetchApiV2(`faciesdescription?id=${id}`, "DELETE");
};

// stratigraphy
const fetchStratigraphiesByBoreholeId = async (boreholeId: number): Promise<StratigraphyLegacy[]> => {
  return await fetchApiV2(`stratigraphy?boreholeId=${boreholeId}`, "GET");
};

const createStratigraphy = async (boreholeId: number): Promise<StratigraphyLegacy> => {
  return await fetchApiV2("stratigraphy", "POST", { boreholeId });
};

const copyStratigraphy = async (stratigraphy: StratigraphyLegacy): Promise<number> => {
  return await fetchApiV2(`stratigraphy/copy?id=${stratigraphy.id}`, "POST");
};

const updateStratigraphy = async (stratigraphy: StratigraphyLegacy): Promise<StratigraphyLegacy> => {
  // remove derived objects
  delete stratigraphy.createdBy;
  delete stratigraphy.updatedBy;

  return await fetchApiV2("stratigraphy", "PUT", stratigraphy);
};

const deleteStratigraphy = async (id: number): Promise<void> => {
  return await fetchApiV2(`stratigraphy?id=${id}`, "DELETE");
};

export const addBedrock = async (id: number): Promise<void> => {
  return await fetchApiV2(`stratigraphy/addbedrock?id=${id}`, "POST");
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
      return await fetchApiV2(`${stratigraphyController}?boreholeId=${boreholeId!}`, "GET");
    },
    enabled: !!boreholeId,
  });

export const useStratigraphyMutations = () => {
  const useAddStratigraphy = useMutation({
    mutationFn: async (stratigraphy: Stratigraphy) => {
      return await fetchApiV2WithApiError(stratigraphyController, "POST", stratigraphy);
    },
  });

  const useCopyStratigraphy = useMutation({
    mutationFn: async (stratigraphy: Stratigraphy) => {
      return await fetchApiV2WithApiError(`${stratigraphyController}/copy?id=${stratigraphy.id}`, "POST");
    },
  });

  const useUpdateStratigraphy = useMutation({
    mutationFn: async (stratigraphy: Stratigraphy) => {
      // remove derived objects
      delete stratigraphy.createdBy;
      delete stratigraphy.updatedBy;

      return await fetchApiV2WithApiError(stratigraphyController, "PUT", stratigraphy);
    },
  });

  const useDeleteStratigraphy = useMutation({
    mutationFn: async (stratigraphy: Stratigraphy) => {
      return await fetchApiV2WithApiError(`${stratigraphyController}?id=${stratigraphy.id}`, "DELETE");
    },
  });

  useShowAlertOnError(useCopyStratigraphy.isError, useCopyStratigraphy.error);
  useShowAlertOnError(useDeleteStratigraphy.isError, useDeleteStratigraphy.error);

  return {
    add: useAddStratigraphy,
    copy: useCopyStratigraphy,
    update: useUpdateStratigraphy,
    delete: useDeleteStratigraphy,
  };
};

export const useReloadStratigraphies = () => {
  const queryClient = useQueryClient();
  const resetTabStatus = useResetTabStatus(["lithology", "lithostratigraphy", "chronostratigraphy"]);
  return (boreholeId: number) => {
    resetTabStatus();
    queryClient.invalidateQueries({ queryKey: [stratigraphiesByBoreholeIdQueryKey, boreholeId] });
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

  useShowAlertOnError(useAddStratigraphy.isError, useAddStratigraphy.error);
  useShowAlertOnError(useCopyStratigraphy.isError, useCopyStratigraphy.error);
  useShowAlertOnError(useUpdateStratigraphy.isError, useUpdateStratigraphy.error);
  useShowAlertOnError(useDeleteStratigraphy.isError, useDeleteStratigraphy.error);

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

export const useLithoDescription = (selectedStratigraphyID?: number) =>
  useQuery({
    queryKey: [lithologicalDescriptionQueryKey, selectedStratigraphyID],
    queryFn: () => fetchLithologicalDescriptionsByProfileId(selectedStratigraphyID!),
    enabled: !!selectedStratigraphyID,
  });

export const faciesDescriptionQueryKey = "faciesDesc";

export const useFaciesDescription = (selectedStratigraphyID?: number) =>
  useQuery({
    queryKey: [faciesDescriptionQueryKey, selectedStratigraphyID],
    queryFn: () => fetchFaciesDescriptionsByProfileId(selectedStratigraphyID!),
    enabled: !!selectedStratigraphyID,
  });

export const chronostratigraphiesQueryKey = "chronostratigraphies";

export const useChronostratigraphies = (stratigraphyID?: number) =>
  useQuery({
    queryKey: [chronostratigraphiesQueryKey, stratigraphyID],
    queryFn: async () => {
      return await fetchApiV2(`chronostratigraphy?stratigraphyId=${stratigraphyID}`, "GET");
    },
    enabled: !!stratigraphyID,
  });

export const useChronostratigraphyMutations = () => {
  const queryClient = useQueryClient();
  const resetTabStatus = useResetTabStatus(["chronostratigraphy"]);
  const useAddChronostratigraphy = useMutation({
    mutationFn: async (chronostratigraphy: Chronostratigraphy) => {
      return await fetchApiV2("chronostratigraphy", "POST", chronostratigraphy);
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
      return await fetchApiV2("chronostratigraphy", "PUT", chronostratigraphy);
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
      return await fetchApiV2(`chronostratigraphy?id=${chronostratigraphyId}`, "DELETE");
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
      return await fetchApiV2(`lithostratigraphy?stratigraphyId=${stratigraphyID}`, "GET");
    },
    enabled: !!stratigraphyID,
  });

export const useLithostratigraphyMutations = () => {
  const queryClient = useQueryClient();
  const resetTabStatus = useResetTabStatus(["lithostratigraphy"]);
  const useAddLithostratigraphy = useMutation({
    mutationFn: async (lithostratigraphy: Lithostratigraphy) => {
      return await fetchApiV2("lithostratigraphy", "POST", lithostratigraphy);
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
      return await fetchApiV2("lithostratigraphy", "PUT", lithostratigraphy);
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
      return await fetchApiV2(`lithostratigraphy?id=${lithostratigraphyId}`, "DELETE");
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
