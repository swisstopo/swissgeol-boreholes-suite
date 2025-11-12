import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchApiV2WithApiError } from "../../../../api/fetchApiV2.ts";
import { BaseLayer } from "../../../../api/stratigraphy.ts";
import { Codelist } from "../../../../components/codelist.ts";
import { useResetTabStatus } from "../../../../hooks/useResetTabStatus.ts";

export interface FaciesDescription extends BaseLayer {
  description?: string;
  faciesId?: number | null;
  facies?: Codelist | null;
}

export const fetchFaciesDescriptionsByProfileId = async (profileId: number): Promise<FaciesDescription[]> => {
  return await fetchApiV2WithApiError<FaciesDescription[]>(`faciesdescription?stratigraphyId=${profileId}`, "GET");
};

export const addFaciesDescription = async (faciesDescription: FaciesDescription): Promise<FaciesDescription> => {
  return await fetchApiV2WithApiError<FaciesDescription>("faciesdescription", "POST", faciesDescription);
};

export const updateFaciesDescription = async (faciesDescription: FaciesDescription): Promise<FaciesDescription> => {
  return await fetchApiV2WithApiError<FaciesDescription>("faciesdescription", "PUT", faciesDescription);
};

export const deleteFaciesDescription = async (id: number): Promise<void> => {
  await fetchApiV2WithApiError(`faciesdescription?id=${id}`, "DELETE");
};

export const faciesDescriptionQueryKey = "faciesDescription";

export const useFaciesDescriptions = (stratigraphyId?: number) =>
  useQuery({
    queryKey: [faciesDescriptionQueryKey, stratigraphyId],
    queryFn: async () => {
      return await fetchFaciesDescriptionsByProfileId(stratigraphyId!);
    },
    enabled: !!stratigraphyId,
  });

interface MutationContext {
  previousFaciesDescriptions?: FaciesDescription[];
}

export const useFaciesDescriptionMutations = (skipInvalidation = false) => {
  const queryClient = useQueryClient();
  const resetTabStatus = useResetTabStatus(["lithology"]);

  const getFaciesDescriptionsSnapshot = async (faciesDescriptionId: number) => {
    await queryClient.cancelQueries({ queryKey: [faciesDescriptionQueryKey, faciesDescriptionId] });
    return queryClient.getQueryData<FaciesDescription[]>([faciesDescriptionQueryKey, faciesDescriptionId]);
  };

  const commonOnSuccess = () => {
    if (!skipInvalidation) {
      resetTabStatus();
      queryClient.invalidateQueries({ queryKey: [faciesDescriptionQueryKey] });
    }
  };

  const commonOnError = (faciesDescription: FaciesDescription, context?: MutationContext) => {
    if (context?.previousFaciesDescriptions) {
      queryClient.setQueryData(
        [faciesDescriptionQueryKey, faciesDescription.stratigraphyId],
        context.previousFaciesDescriptions,
      );
    }
  };

  // Use to manually invalidate queries after awaiting promises in batch updates, use with skipInvalidation
  // Todo: use batch updates methods for faciesDesciptions
  const invalidateQueries = () => {
    resetTabStatus();
    queryClient.invalidateQueries({ queryKey: [faciesDescriptionQueryKey] });
  };

  const useAddFaciesDescription = useMutation({
    mutationFn: async (faciesDescription: FaciesDescription) => {
      return addFaciesDescription(faciesDescription);
    },
    onMutate: async (newFaciesDescription: FaciesDescription) => {
      const previousFaciesDescriptions = await getFaciesDescriptionsSnapshot(newFaciesDescription.id);
      const optimisticFaciesDescription = {
        ...newFaciesDescription,
        id: Date.now(), // Temporary ID until server responds
      };
      queryClient.setQueryData<FaciesDescription[]>(
        [faciesDescriptionQueryKey, newFaciesDescription.stratigraphyId],
        old => (old ? [...old, optimisticFaciesDescription] : [optimisticFaciesDescription]),
      );
      return { previousFaciesDescriptions };
    },
    onError: (err, faciesDescription, context) => commonOnError(faciesDescription, context),
    onSuccess: commonOnSuccess,
  });

  const useUpdateFaciesDescription = useMutation({
    mutationFn: async (faciesDescription: FaciesDescription) => {
      return updateFaciesDescription(faciesDescription);
    },
    onMutate: async (updatedFaciesDescription: FaciesDescription) => {
      const previousFaciesDescriptions = await getFaciesDescriptionsSnapshot(updatedFaciesDescription.id);
      queryClient.setQueryData<FaciesDescription[]>(
        [faciesDescriptionQueryKey, updatedFaciesDescription.stratigraphyId],
        old =>
          old ? old.map(l => (l.id === updatedFaciesDescription.id ? { ...l, ...updatedFaciesDescription } : l)) : [],
      );
      return { previousFaciesDescriptions };
    },
    onError: (err, faciesDescription, context) => commonOnError(faciesDescription, context),
    onSuccess: commonOnSuccess,
  });

  const useDeleteFaciesDescription = useMutation({
    mutationFn: async (faciesDescription: FaciesDescription) => {
      return deleteFaciesDescription(faciesDescription.id);
    },
    onMutate: async (deletedFaciesDescription: FaciesDescription) => {
      const previousFaciesDescriptions = await getFaciesDescriptionsSnapshot(deletedFaciesDescription.id);
      queryClient.setQueryData<FaciesDescription[]>(
        [faciesDescriptionQueryKey, deletedFaciesDescription.stratigraphyId],
        old => (old ? old.filter(l => l.id !== deletedFaciesDescription.id) : []),
      );
      return { previousFaciesDescriptions };
    },
    onError: (err, faciesDescription, context) => commonOnError(faciesDescription, context),
    onSuccess: commonOnSuccess,
  });

  return {
    add: useAddFaciesDescription,
    update: useUpdateFaciesDescription,
    delete: useDeleteFaciesDescription,
    invalidateQueries,
  };
};
