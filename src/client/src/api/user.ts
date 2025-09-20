import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { User } from "./apiInterfaces.ts";
import { fetchApiV2WithApiError } from "./fetchApiV2.ts";

export const fetchCurrentUser = async (): Promise<User> => await fetchApiV2WithApiError("user/self", "GET");

export const fetchUser = async (id: number): Promise<User> => await fetchApiV2WithApiError(`user/${id}`, "GET");

export const fetchUsers = async (): Promise<User[]> => await fetchApiV2WithApiError("user", "GET");

export const fetchEditorUsersOnWorkgroup = async (workgroupId: number): Promise<User[]> =>
  await fetchApiV2WithApiError(`user/editorsOnWorkgroup/${workgroupId}`, "GET");

export const updateUser = async (user: User) => {
  if (user.disabledAt) {
    user.disabledAt = new Date(user.disabledAt).toISOString();
  }
  return await fetchApiV2WithApiError("user", "PUT", user);
};

export const deleteUser = async (id: number) => await fetchApiV2WithApiError(`user/${id}`, "DELETE");

export const usersQueryKey = "users";
const currentUserQueryKey = "currentUser";

export const useUsers = () => {
  return useQuery({
    queryKey: [usersQueryKey],
    queryFn: fetchUsers,
  });
};

export const useEditorUsersOnWorkgroup = (workgroupId: number) => {
  return useQuery({
    queryKey: [usersQueryKey, "editors", workgroupId],
    queryFn: () => fetchEditorUsersOnWorkgroup(workgroupId),
    enabled: !!workgroupId,
  });
};

export const useCurrentUser = () => {
  return useQuery({
    queryKey: [currentUserQueryKey],
    queryFn: fetchCurrentUser,
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
