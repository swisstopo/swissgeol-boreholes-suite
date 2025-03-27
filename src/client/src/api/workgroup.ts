import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useShowAlertOnError } from "../hooks/useShowAlertOnError.ts";
import { Role, Workgroup, WorkgroupRole } from "./apiInterfaces.ts";
import { fetchApiV2, fetchApiV2WithApiError } from "./fetchApiV2.ts";

export const fetchWorkgroups = async (): Promise<Workgroup[]> => await fetchApiV2("workgroup", "GET");

export const fetchWorkgroupById = async (id: number) => await fetchApiV2(`workgroup/${id}`, "GET");

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

export const removeAllWorkgroupRolesForUser = async (userId: number, workgroupId: number, roles: Role[]) => {
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
  const query = useQuery({
    queryKey: [workgroupQueryKey],
    queryFn: fetchWorkgroups,
  });

  // integrate error alert into query
  useShowAlertOnError(query.isError, query.error);
  return query;
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
    delete: useDeleteWorkgroup,
  };
};
