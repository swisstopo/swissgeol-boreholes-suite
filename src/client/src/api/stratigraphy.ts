import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useShowAlertOnError } from "../hooks/useShowAlertOnError.ts";
import { User } from "./apiInterfaces.ts";
import { boreholeQueryKey, BoreholeV2 } from "./borehole.ts";
import { fetchApiV2 } from "./fetchApiV2.ts";

export interface Stratigraphy {
  id: number;
  boreholeId: number;
  borehole: BoreholeV2 | null;
  isPrimary: boolean;
  date: string | null;
  created: Date | string | null;
  createdById: number;
  createdBy?: User;
  updated: Date | string | null;
  updatedById: number;
  updatedBy?: User;
  name: string;
  qualityId: number;
  notes: string;
  layers: Layer[];
  chronostratigraphyLayers: Chronostratigraphy[];
  lithostratigraphyLayers: Lithostratigraphy[];
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
const fetchStratigraphy = async (id: number): Promise<Stratigraphy> => {
  return await fetchApiV2(`stratigraphy/${id}`, "GET");
};

const fetchStratigraphiesByBoreholeId = async (boreholeId: number): Promise<Stratigraphy[]> => {
  return await fetchApiV2(`stratigraphy?boreholeId=${boreholeId}`, "GET");
};

const createStratigraphy = async (boreholeId: number): Promise<Stratigraphy> => {
  return await fetchApiV2("stratigraphy", "POST", { boreholeId });
};

const copyStratigraphy = async (stratigraphy: Stratigraphy): Promise<number> => {
  return await fetchApiV2(`stratigraphy/copy?id=${stratigraphy.id}`, "POST");
};

const updateStratigraphy = async (stratigraphy: Stratigraphy): Promise<Stratigraphy> => {
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

export const stratigraphyQueryKey = "stratigraphy";
export const stratigraphiesByBoreholeIdQueryKey = "stratigraphiesByBoreholeId";

export const useStratigraphy = (id?: number) =>
  useQuery({
    queryKey: [stratigraphyQueryKey, id],
    queryFn: () => fetchStratigraphy(id!),
    enabled: !!id,
  });

export const useStratigraphiesByBoreholeId = (boreholeId?: number) =>
  useQuery({
    queryKey: [stratigraphiesByBoreholeIdQueryKey, boreholeId],
    queryFn: () => fetchStratigraphiesByBoreholeId(boreholeId!),
    enabled: !!boreholeId,
  });

export const useStratigraphyMutations = () => {
  const queryClient = useQueryClient();

  const invalidateQueries = (stratigraphy: Stratigraphy, invalidateBorehole: boolean) => {
    queryClient.invalidateQueries({ queryKey: [stratigraphyQueryKey, stratigraphy.id] });
    queryClient.invalidateQueries({ queryKey: [stratigraphiesByBoreholeIdQueryKey, stratigraphy.boreholeId] });
    if (invalidateBorehole) {
      queryClient.invalidateQueries({ queryKey: [boreholeQueryKey, stratigraphy.boreholeId] });
    }
  };

  const useAddStratigraphy = useMutation({
    mutationFn: async (boreholeId: number) => {
      return await createStratigraphy(boreholeId);
    },
    onSuccess: addedStratigraphy => {
      invalidateQueries(addedStratigraphy, true);
    },
  });

  const useCopyStratigraphy = useMutation({
    mutationFn: async (stratigraphy: Stratigraphy) => {
      return await copyStratigraphy(stratigraphy);
    },
    onSuccess: (_data, originalStratigraphy) => {
      invalidateQueries(originalStratigraphy, true);
    },
  });

  const useUpdateStratigraphy = useMutation({
    mutationFn: async (stratigraphy: Stratigraphy) => {
      return await updateStratigraphy(stratigraphy);
    },
    onSuccess: updatedStratigraphy => {
      invalidateQueries(updatedStratigraphy, false);
    },
  });

  const useDeleteStratigraphy = useMutation({
    mutationFn: async (stratigraphy: Stratigraphy) => {
      return await deleteStratigraphy(stratigraphy.id);
    },
    onSuccess: (_data, stratigraphy) => {
      invalidateQueries(stratigraphy, true);
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
  const useAddChronostratigraphy = useMutation({
    mutationFn: async (chronostratigraphy: Chronostratigraphy) => {
      return await fetchApiV2("chronostratigraphy", "POST", chronostratigraphy);
    },
    onSuccess: () => {
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
  const useAddLithostratigraphy = useMutation({
    mutationFn: async (lithostratigraphy: Lithostratigraphy) => {
      return await fetchApiV2("lithostratigraphy", "POST", lithostratigraphy);
    },
    onSuccess: () => {
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
