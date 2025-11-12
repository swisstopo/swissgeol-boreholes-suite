import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useResetTabStatus } from "../hooks/useResetTabStatus.ts";
import { Lithology } from "../pages/detail/form/stratigraphy/lithology.ts";
import { NullableDateString, User } from "./apiInterfaces.ts";
import { boreholeQueryKey, BoreholeV2 } from "./borehole.ts";
import { fetchApiV2WithApiError } from "./fetchApiV2.ts";

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
  fromDepth: number;
  toDepth: number;
  stratigraphyId: number;
  stratigraphy?: Stratigraphy;
  created?: NullableDateString;
  createdById?: number | null;
  createdBy?: User;
  updated?: NullableDateString;
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
      return await fetchApiV2WithApiError<Stratigraphy[]>(`${stratigraphyController}?boreholeId=${boreholeId!}`, "GET");
    },
    enabled: !!boreholeId,
  });

export const useStratigraphyMutations = () => {
  const queryClient = useQueryClient();
  const resetTabStatus = useResetTabStatus(["lithology", "lithostratigraphy", "chronostratigraphy"]);

  const useAddStratigraphy = useMutation({
    mutationFn: async (stratigraphy: Stratigraphy) => {
      return await fetchApiV2WithApiError<Stratigraphy>(stratigraphyController, "POST", stratigraphy);
    },
    onSuccess: (_data, stratigraphy) => {
      resetTabStatus();
      invalidateStratigraphyQueries(queryClient, Number(stratigraphy.boreholeId), true);
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

  const useUpdateStratigraphy = useMutation({
    mutationFn: async (stratigraphy: Stratigraphy) => {
      // remove derived objects
      delete stratigraphy.createdBy;
      delete stratigraphy.updatedBy;

      return await fetchApiV2WithApiError<Stratigraphy>(stratigraphyController, "PUT", stratigraphy);
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
