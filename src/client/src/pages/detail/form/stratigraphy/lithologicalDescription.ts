import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchApiV2WithApiError } from "../../../../api/fetchApiV2.ts";
import { BaseLayer } from "../../../../api/stratigraphy.ts";
import { useResetTabStatus } from "../../../../hooks/useResetTabStatus.ts";
import { ExtractionBoundingBox } from "../../labeling/labelingInterfaces.tsx";

export interface LithologicalDescription extends BaseLayer {
  description?: string;
}

export interface ExtractedLithologicalDescription extends LithologicalDescription {
  startDepthBoundingBoxes: ExtractionBoundingBox[];
  endDepthBoundingBoxes: ExtractionBoundingBox[];
  descriptionBoundingBoxes: ExtractionBoundingBox[];
}

export const fetchLithologicalDescriptionsByProfileId = async (
  profileId: number,
): Promise<LithologicalDescription[]> => {
  return await fetchApiV2WithApiError<LithologicalDescription[]>(
    `lithologicaldescription?stratigraphyId=${profileId}`,
    "GET",
  );
};

export const addLithologicalDescription = async (
  lithologicalDescription: LithologicalDescription,
): Promise<LithologicalDescription> => {
  return await fetchApiV2WithApiError<LithologicalDescription>(
    "lithologicaldescription",
    "POST",
    lithologicalDescription,
  );
};

export const updateLithologicalDescription = async (
  lithologicalDescription: LithologicalDescription,
): Promise<LithologicalDescription> => {
  return await fetchApiV2WithApiError<LithologicalDescription>(
    "lithologicaldescription",
    "PUT",
    lithologicalDescription,
  );
};

export const deleteLithologicalDescription = async (id: number): Promise<void> => {
  await fetchApiV2WithApiError(`lithologicaldescription?id=${id}`, "DELETE");
};

export const lithologicalDescriptionQueryKey = "lithologicalDescription";

export const useLithologicalDescriptions = (stratigraphyId?: number) =>
  useQuery({
    queryKey: [lithologicalDescriptionQueryKey, stratigraphyId],
    queryFn: async () => {
      return await fetchLithologicalDescriptionsByProfileId(stratigraphyId!);
    },
    enabled: !!stratigraphyId,
  });

interface MutationContext {
  previousLithologicalDescriptions?: LithologicalDescription[];
}

export const useLithologicalDescriptionMutations = (skipInvalidation = false) => {
  const queryClient = useQueryClient();
  const resetTabStatus = useResetTabStatus(["lithology"]);

  const getLithologicalDescriptionsSnapshot = async (lithologicalDescriptionId: number) => {
    await queryClient.cancelQueries({ queryKey: [lithologicalDescriptionQueryKey, lithologicalDescriptionId] });
    return queryClient.getQueryData<LithologicalDescription[]>([
      lithologicalDescriptionQueryKey,
      lithologicalDescriptionId,
    ]);
  };

  const commonOnSuccess = () => {
    if (!skipInvalidation) {
      resetTabStatus();
      queryClient.invalidateQueries({ queryKey: [lithologicalDescriptionQueryKey] });
    }
  };

  const commonOnError = (lithologicalDescription: LithologicalDescription, context?: MutationContext) => {
    if (context?.previousLithologicalDescriptions) {
      queryClient.setQueryData(
        [lithologicalDescriptionQueryKey, lithologicalDescription.stratigraphyId],
        context.previousLithologicalDescriptions,
      );
    }
  };

  // Use to manually invalidate queries after awaiting promises in batch updates, use with skipInvalidation
  // Todo: use batch updates methods for lithologicalDescriptions
  const invalidateQueries = () => {
    resetTabStatus();
    queryClient.invalidateQueries({ queryKey: [lithologicalDescriptionQueryKey] });
  };

  const useAddLithologicalDescription = useMutation({
    mutationFn: async (lithologicalDescription: LithologicalDescription) => {
      return addLithologicalDescription(lithologicalDescription);
    },
    onMutate: async (newLithologicalDescription: LithologicalDescription) => {
      const previousLithologicalDescriptions = await getLithologicalDescriptionsSnapshot(newLithologicalDescription.id);
      const optimisticLithologicalDescription = {
        ...newLithologicalDescription,
        id: Date.now(), // Temporary ID until server responds
      };
      queryClient.setQueryData<LithologicalDescription[]>(
        [lithologicalDescriptionQueryKey, newLithologicalDescription.stratigraphyId],
        old => (old ? [...old, optimisticLithologicalDescription] : [optimisticLithologicalDescription]),
      );
      return { previousLithologicalDescriptions };
    },
    onError: (err, lithologicalDescription, context) => commonOnError(lithologicalDescription, context),
    onSuccess: commonOnSuccess,
  });

  const useUpdateLithologicalDescription = useMutation({
    mutationFn: async (lithologicalDescription: LithologicalDescription) => {
      return updateLithologicalDescription(lithologicalDescription);
    },
    onMutate: async (updatedLithologicalDescription: LithologicalDescription) => {
      const previousLithologicalDescriptions = await getLithologicalDescriptionsSnapshot(
        updatedLithologicalDescription.id,
      );
      queryClient.setQueryData<LithologicalDescription[]>(
        [lithologicalDescriptionQueryKey, updatedLithologicalDescription.stratigraphyId],
        old =>
          old
            ? old.map(l =>
                l.id === updatedLithologicalDescription.id ? { ...l, ...updatedLithologicalDescription } : l,
              )
            : [],
      );
      return { previousLithologicalDescriptions };
    },
    onError: (err, lithologicalDescription, context) => commonOnError(lithologicalDescription, context),
    onSuccess: commonOnSuccess,
  });

  const useDeleteLithologicalDescription = useMutation({
    mutationFn: async (lithologicalDescription: LithologicalDescription) => {
      return deleteLithologicalDescription(lithologicalDescription.id);
    },
    onMutate: async (deletedLithologicalDescription: LithologicalDescription) => {
      const previousLithologicalDescriptions = await getLithologicalDescriptionsSnapshot(
        deletedLithologicalDescription.id,
      );
      queryClient.setQueryData<LithologicalDescription[]>(
        [lithologicalDescriptionQueryKey, deletedLithologicalDescription.stratigraphyId],
        old => (old ? old.filter(l => l.id !== deletedLithologicalDescription.id) : []),
      );
      return { previousLithologicalDescriptions };
    },
    onError: (err, lithologicalDescription, context) => commonOnError(lithologicalDescription, context),
    onSuccess: commonOnSuccess,
  });

  return {
    add: useAddLithologicalDescription,
    update: useUpdateLithologicalDescription,
    delete: useDeleteLithologicalDescription,
    invalidateQueries,
  };
};
