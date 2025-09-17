import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Role, Workgroup, WorkgroupRole } from "./apiInterfaces.ts";
import { fetchApiV2, fetchApiV2WithApiError } from "./fetchApiV2.ts";
import { usersQueryKey } from "./user.ts";

export const fetchWorkgroups = async (): Promise<Workgroup[]> => await fetchApiV2("workgroup", "GET");

export const fetchWorkgroupById = async (id: number): Promise<Workgroup> => await fetchApiV2(`workgroup/${id}`, "GET");

export const createWorkgroup = async (workgroup: Workgroup) =>
  await fetchApiV2WithApiError("workgroup", "POST", workgroup);

export const updateWorkgroup = async (workgroup: Workgroup) => {
  if (workgroup.disabledAt) {
    workgroup.disabledAt = new Date(workgroup.disabledAt).toISOString();
  }
  workgroup.isDisabled = undefined;

  return await fetchApiV2("workgroup", "PUT", workgroup);
};

export const deleteWorkgroup = async (id: number) => await fetchApiV2(`workgroup/${id}`, "DELETE");

export const setWorkgroupRole = async (userId: number, workgroupId: number, role: Role, isActive: boolean) => {
  const workgroupRole: WorkgroupRole[] = [
    {
      workgroupId: workgroupId,
      userId: userId,
      role: role,
      isActive: isActive,
    },
  ];
  return await fetchApiV2("workgroup/setRoles", "POST", workgroupRole);
};

export const removeAllWorkgroupRolesForUser = async (
  userId: number,
  workgroupId: number,
  roles: Role[],
): Promise<void> => {
  const workgroupRoles: WorkgroupRole[] = [];
  for (const role of roles) {
    workgroupRoles.push({
      workgroupId: workgroupId,
      userId: userId,
      role: role,
      isActive: false,
    });
  }
  return await fetchApiV2("workgroup/setRoles", "POST", workgroupRoles);
};

export const workgroupQueryKey = "workgroups";

export const useWorkgroups = () => {
  return useQuery({
    queryKey: [workgroupQueryKey],
    queryFn: fetchWorkgroups,
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
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [workgroupQueryKey],
      });
    },
  });

  const useUpdateWorkgroup = useMutation({
    mutationFn: async (workgroup: Workgroup) => {
      return await updateWorkgroup(workgroup);
    },
    onSettled: (_data, _error, useUpdateWorkgroup) => {
      queryClient.invalidateQueries({ queryKey: [workgroupQueryKey] });
      queryClient.invalidateQueries({ queryKey: [workgroupQueryKey, useUpdateWorkgroup.id] });
    },
  });

  const useRemoveAllWorkgroupRoles = useMutation({
    mutationFn: async ({ userId, workgroupId, roles }: { userId: number; workgroupId: number; roles: Role[] }) => {
      return await removeAllWorkgroupRolesForUser(userId, workgroupId, roles);
    },
    onSettled: (_data, _error, variables) => {
      queryClient.invalidateQueries({ queryKey: [workgroupQueryKey] });
      queryClient.invalidateQueries({ queryKey: [workgroupQueryKey, variables.workgroupId] });
      queryClient.invalidateQueries({ queryKey: [usersQueryKey] });
      queryClient.invalidateQueries({ queryKey: [usersQueryKey, variables.userId] });
    },
  });

  const useSetWorkgroupRole = useMutation({
    mutationFn: async ({
      userId,
      workgroupId,
      role,
      isActive,
    }: {
      userId: number;
      workgroupId: number;
      role: Role;
      isActive: boolean;
    }) => {
      return await setWorkgroupRole(userId, workgroupId, role, isActive);
    },
    onSettled: (_data, _error, variables) => {
      queryClient.invalidateQueries({ queryKey: [workgroupQueryKey] });
      queryClient.invalidateQueries({ queryKey: [workgroupQueryKey, variables.workgroupId] });
      queryClient.invalidateQueries({ queryKey: [usersQueryKey] });
      queryClient.invalidateQueries({ queryKey: [usersQueryKey, variables.userId] });
    },
  });

  const useDeleteWorkgroup = useMutation({
    mutationFn: async (workgroupId: number) => {
      return await deleteWorkgroup(workgroupId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [workgroupQueryKey],
      });
    },
  });

  return {
    add: useAddWorkgroup,
    update: useUpdateWorkgroup,
    setWorkgroupRole: useSetWorkgroupRole,
    removeAllRoles: useRemoveAllWorkgroupRoles,
    delete: useDeleteWorkgroup,
  };
};
