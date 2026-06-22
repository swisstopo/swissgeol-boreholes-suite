import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchApiV2WithApiError } from "./fetchApiV2.ts";
import { Role, User, Workgroup } from "./generated";

const hasEditorRole = (role?: Role): boolean => role !== undefined && role !== "View";

const removeDuplicateWorkgroups = (workgroups: (Workgroup | undefined)[]): Workgroup[] => {
  const byId = new Map<number, Workgroup>();
  for (const workgroup of workgroups) {
    if (workgroup && !byId.has(workgroup.id)) {
      byId.set(workgroup.id, workgroup);
    }
  }
  return [...byId.values()];
};

export const getUserWorkgroups = (user?: User): Workgroup[] =>
  removeDuplicateWorkgroups(user?.workgroupRoles?.map(r => r.workgroup) ?? []);

export const getEditableWorkgroups = (user?: User): Workgroup[] =>
  removeDuplicateWorkgroups(
    user?.workgroupRoles
      ?.filter(r => hasEditorRole(r.role) && r.workgroup?.isDisabled === false)
      .map(r => r.workgroup) ?? [],
  );

export const isEditorUser = (user?: User): boolean => !!user?.workgroupRoles?.some(r => hasEditorRole(r.role));

const fetchCurrentUser = async (): Promise<User> => await fetchApiV2WithApiError<User>("user/self", "GET");

const fetchUser = async (id: number): Promise<User> => await fetchApiV2WithApiError(`user/${id}`, "GET");

const fetchUsers = async (): Promise<User[]> => await fetchApiV2WithApiError<User[]>("user", "GET");

const fetchEditorUsersOnWorkgroup = async (workgroupId: number): Promise<User[]> =>
  await fetchApiV2WithApiError<User[]>(`user/editorsOnWorkgroup/${workgroupId}`, "GET");

const updateUser = async (user: User) => {
  if (user.disabledAt) {
    user.disabledAt = new Date(user.disabledAt).toISOString();
  }
  return await fetchApiV2WithApiError("user", "PUT", user);
};

const deleteUser = async (id: number) => await fetchApiV2WithApiError(`user/${id}`, "DELETE");

export const usersQueryKey = "users";
const currentUserQueryKey = "currentUser";

export const useUsers = () => {
  return useQuery({
    queryKey: [usersQueryKey],
    queryFn: fetchUsers,
  });
};

export const useEditorUsersOnWorkgroup = (workgroupId?: number) => {
  return useQuery({
    queryKey: [usersQueryKey, "editors", workgroupId],
    queryFn: () => fetchEditorUsersOnWorkgroup(workgroupId!),
    enabled: !!workgroupId,
  });
};

export const useCurrentUser = (enabled = true) => {
  return useQuery({
    queryKey: [currentUserQueryKey],
    queryFn: fetchCurrentUser,
    enabled,
  });
};

export const useSelectedUser = (id: number) => {
  return useQuery({
    queryKey: [usersQueryKey, id],
    queryFn: async () => {
      return await fetchUser(id);
    },
    enabled: !!id,
  });
};

export const useUserMutations = () => {
  const queryClient = useQueryClient();
  const useUpdateUser = useMutation({
    mutationFn: async (user: User) => {
      return await updateUser(user);
    },
    onMutate: async (updatedUser: User) => {
      await queryClient.cancelQueries({ queryKey: [usersQueryKey] });
      const previousUsers = queryClient.getQueryData<User[]>([usersQueryKey]);
      const previousSelectedUser = queryClient.getQueryData<User>([usersQueryKey, updatedUser.id]);
      queryClient.setQueryData<User[]>([usersQueryKey], old =>
        old?.map(user => (user.id === updatedUser.id ? { ...user, ...updatedUser } : user)),
      );
      queryClient.setQueryData<User>([usersQueryKey, updatedUser.id], old => ({ ...old, ...updatedUser }));
      return { previousUsers, previousSelectedUser };
    },
    onError: (_err, _newUser, context) => {
      if (context?.previousUsers) {
        queryClient.setQueryData([usersQueryKey], context.previousUsers);
      }
      if (context?.previousSelectedUser) {
        queryClient.setQueryData([usersQueryKey, _newUser.id], context.previousSelectedUser);
      }
    },

    onSettled: (_data, _error, updatedUser) => {
      queryClient.invalidateQueries({ queryKey: [usersQueryKey] });
      queryClient.invalidateQueries({ queryKey: [usersQueryKey, updatedUser.id] });
    },
  });

  const useDeleteUser = useMutation({
    mutationFn: async (userId: number) => {
      return await deleteUser(userId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [usersQueryKey] });
    },
  });

  return {
    update: useUpdateUser,
    delete: useDeleteUser,
  };
};
