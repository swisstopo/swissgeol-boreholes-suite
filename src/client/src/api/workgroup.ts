import { useIsMutating, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "../auth/useBoreholesAuth.tsx";
import { fetchApiV2WithApiError } from "./fetchApiV2.ts";
import { Role, Workgroup } from "./generated/types.gen";
import { currentUserQueryKey, usersQueryKey } from "./user.ts";

const fetchWorkgroups = async (): Promise<Workgroup[]> => await fetchApiV2WithApiError("workgroup", "GET");

const fetchWorkgroupById = async (id: number): Promise<Workgroup> =>
  await fetchApiV2WithApiError(`workgroup/${id}`, "GET");

const createWorkgroup = async (workgroup: Workgroup) => await fetchApiV2WithApiError("workgroup", "POST", workgroup);

const updateWorkgroup = async (workgroup: Workgroup) => {
  if (workgroup.disabledAt) {
    workgroup.disabledAt = new Date(workgroup.disabledAt).toISOString();
  }
  (workgroup as { isDisabled?: boolean }).isDisabled = undefined;

  return await fetchApiV2WithApiError("workgroup", "PUT", workgroup);
};

const deleteWorkgroup = async (id: number) => await fetchApiV2WithApiError(`workgroup/${id}`, "DELETE");

interface WorkgroupRoleChange {
  userId: number;
  workgroupId: number;
  role: Role;
  isActive: boolean;
}

const setWorkgroupRoles = async (changes: WorkgroupRoleChange[]) =>
  await fetchApiV2WithApiError("workgroup/setRoles", "POST", changes);

export const workgroupQueryKey = "workgroups";
const setWorkgroupRolesMutationKey = "setWorkgroupRoles";

/**
 * Whether any component is saving workgroup roles. Pending state of a single mutation is local to the
 * component that started it, so this lets a table lock its role selects while a dialog saves too.
 */
export const useIsSettingWorkgroupRoles = () => useIsMutating({ mutationKey: [setWorkgroupRolesMutationKey] }) > 0;

export const useWorkgroups = () => {
  const auth = useAuth();
  return useQuery({
    queryKey: [workgroupQueryKey],
    queryFn: fetchWorkgroups,
    enabled: !auth.anonymousModeEnabled,
  });
};

export const useSelectedWorkgroup = (id: number) => {
  return useQuery({
    queryKey: [workgroupQueryKey, id],
    queryFn: async () => {
      return await fetchWorkgroupById(id);
    },
    enabled: !!id,
  });
};

export const useWorkgroupMutations = () => {
  const queryClient = useQueryClient();
  const useAddWorkgroup = useMutation({
    mutationFn: async (workgroup: Workgroup) => {
      return await createWorkgroup(workgroup);
    },
    // The invalidations in this hook are deliberately not awaited: returning their promise would
    // keep the mutation pending until every refetch settled, rather than until the write succeeded.
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: [workgroupQueryKey],
      });
    },
  });

  const useUpdateWorkgroup = useMutation({
    mutationFn: async (workgroup: Workgroup) => {
      return await updateWorkgroup(workgroup);
    },
    onSettled: (_data, _error, useUpdateWorkgroup) => {
      void queryClient.invalidateQueries({ queryKey: [workgroupQueryKey] });
      void queryClient.invalidateQueries({ queryKey: [workgroupQueryKey, useUpdateWorkgroup.id] });
    },
  });

  const useSetWorkgroupRoles = useMutation({
    mutationKey: [setWorkgroupRolesMutationKey],
    mutationFn: async (changes: WorkgroupRoleChange[]) => {
      return await setWorkgroupRoles(changes);
    },
    onSettled: () =>
      Promise.all([
        queryClient.invalidateQueries({ queryKey: [workgroupQueryKey] }),
        queryClient.invalidateQueries({ queryKey: [usersQueryKey] }),
        // The current user is refetched too, as an admin may change their own role.
        queryClient.invalidateQueries({ queryKey: [currentUserQueryKey] }),
      ]),
  });

  const useDeleteWorkgroup = useMutation({
    mutationFn: async (workgroupId: number) => {
      return await deleteWorkgroup(workgroupId);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: [workgroupQueryKey],
      });
    },
  });

  return {
    add: useAddWorkgroup,
    update: useUpdateWorkgroup,
    setWorkgroupRoles: useSetWorkgroupRoles,
    delete: useDeleteWorkgroup,
  };
};
