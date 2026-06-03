import { useMutation, useQuery, useQueryClient, UseQueryResult } from "@tanstack/react-query";
import { fetchApiV2Legacy, fetchApiV2WithApiError } from "../../../../api/fetchApiV2.ts";
import { useResetTabStatus } from "../../../../hooks/useResetTabStatus.ts";
import { Lithology } from "./stratigraphy.ts";

interface MutationContext {
  previousLithologies?: Lithology[];
}

const lithologyController = "lithology";

const fetchLithologiesByStratigraphyId = async (stratigraphyId: number): Promise<Lithology[]> =>
  await fetchApiV2Legacy(`lithology?stratigraphyId=${stratigraphyId}`, "GET");

const lithologyQueryKey = "lithologies";

export const useLithologies = (stratigraphyId?: number): UseQueryResult<Lithology[]> =>
  useQuery({
    queryKey: [lithologyQueryKey, stratigraphyId],
    queryFn: async () => {
      return await fetchLithologiesByStratigraphyId(stratigraphyId!);
    },
    enabled: !!stratigraphyId,
  });

export const useLithologyMutations = (skipInvalidation = false) => {
  const queryClient = useQueryClient();
  const resetTabStatus = useResetTabStatus(["lithology"]);

  const getLithologiesSnapshot = async (lithologyId: number) => {
    await queryClient.cancelQueries({ queryKey: [lithologyQueryKey, lithologyId] });
    return queryClient.getQueryData<Lithology[]>([lithologyQueryKey, lithologyId]);
  };

  const commonOnSuccess = () => {
    if (!skipInvalidation) {
      resetTabStatus();
      queryClient.invalidateQueries({ queryKey: [lithologyQueryKey] });
    }
  };

  const commonOnError = (lithology: Lithology, context?: MutationContext) => {
    if (context?.previousLithologies) {
      queryClient.setQueryData([lithologyQueryKey, lithology.stratigraphyId], context.previousLithologies);
    }
  };

  // Use to manually invalidate queries after awaiting promises in batch updates, use with skipInvalidation
  // Todo: use batch updates methods for lithologies
  const invalidateQueries = () => {
    resetTabStatus();
    queryClient.invalidateQueries({ queryKey: [lithologyQueryKey] });
  };

  const useAddLithology = useMutation({
    mutationFn: (lithology: Lithology) => {
      return fetchApiV2WithApiError(`${lithologyController}`, "POST", lithology);
    },
    onMutate: async (newLithology: Lithology) => {
      const previousLithologies = await getLithologiesSnapshot(newLithology.id);
      const optimisticLithology = {
        ...newLithology,
        id: Date.now(), // Temporary ID until server responds
      };
      queryClient.setQueryData<Lithology[]>([lithologyQueryKey, newLithology.stratigraphyId], old =>
        old ? [...old, optimisticLithology] : [optimisticLithology],
      );
      return { previousLithologies };
    },
    onError: (err, lithology, context) => commonOnError(lithology, context),
    onSuccess: commonOnSuccess,
  });

  const useUpdateLithology = useMutation({
    mutationFn: (lithology: Lithology) => {
      return fetchApiV2WithApiError(`${lithologyController}`, "PUT", lithology);
    },
    onMutate: async (updatedLithology: Lithology) => {
      const previousLithologies = await getLithologiesSnapshot(updatedLithology.id);
      queryClient.setQueryData<Lithology[]>([lithologyQueryKey, updatedLithology.stratigraphyId], old =>
        old ? old.map(l => (l.id === updatedLithology.id ? { ...l, ...updatedLithology } : l)) : [],
      );
      return { previousLithologies };
    },
    onError: (err, lithology, context) => commonOnError(lithology, context),
    onSuccess: commonOnSuccess,
  });

  const useDeleteLithology = useMutation({
    mutationFn: (lithology: Lithology) => {
      return fetchApiV2WithApiError(`${lithologyController}?id=${lithology.id}`, "DELETE");
    },
    onMutate: async (deletedLithology: Lithology) => {
      const previousLithologies = await getLithologiesSnapshot(deletedLithology.id);
      queryClient.setQueryData<Lithology[]>([lithologyQueryKey, deletedLithology.stratigraphyId], old =>
        old ? old.filter(l => l.id !== deletedLithology.id) : [],
      );
      return { previousLithologies };
    },
    onError: (err, lithology, context) => commonOnError(lithology, context),
    onSuccess: commonOnSuccess,
  });

  return { add: useAddLithology, update: useUpdateLithology, delete: useDeleteLithology, invalidateQueries };
};
