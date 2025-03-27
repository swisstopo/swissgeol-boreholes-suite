import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useShowAlertOnError } from "../hooks/useShowAlertOnError.ts";
import { User } from "./apiInterfaces.ts";
import { fetchApiV2WithApiError } from "./fetchApiV2.ts";

export const fetchUser = async (id: number): Promise<User> => await fetchApiV2WithApiError(`user/${id}`, "GET");

export const fetchUsers = async (): Promise<User[]> => await fetchApiV2WithApiError("user", "GET");

export const updateUser = async (user: User) => {
  if (user.disabledAt) {
    user.disabledAt = new Date(user.disabledAt).toISOString();
  }
  return await fetchApiV2WithApiError("user", "PUT", user);
};

export const deleteUser = async (id: number) => await fetchApiV2WithApiError(`user/${id}`, "DELETE");

export const usersQueryKey = "users";

export const useUsers = () => {
  const query = useQuery({
    queryKey: [usersQueryKey],
    queryFn: fetchUsers,
  });

  // integrate error alert into query
  useShowAlertOnError(query.isError, query.error);
  return query;
};

export const useUserMutations = () => {
  const queryClient = useQueryClient();
  const useUpdateUser = useMutation({
    mutationFn: async (user: User) => {
      return await updateUser(user);
    },
    // Optimistic update
    onMutate: async (updatedUser: User) => {
      await queryClient.cancelQueries({ queryKey: [usersQueryKey] });
      const previousUsers = queryClient.getQueryData<User[]>([usersQueryKey]);
      queryClient.setQueryData<User[]>([usersQueryKey], old =>
        old?.map(user => (user.id === updatedUser.id ? { ...user, ...updatedUser } : user)),
      );
      return { previousUsers };
    },
    // Rollback on error
    onError: (_err, _newUser, context) => {
      if (context?.previousUsers) {
        queryClient.setQueryData([usersQueryKey], context.previousUsers);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: [usersQueryKey] });
    },
  });

  const useDeleteuseUser = useMutation({
    mutationFn: async (workgroupId: number) => {
      return await deleteUser(workgroupId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [usersQueryKey],
      });
    },
  });

  return {
    update: useUpdateUser,
    delete: useDeleteuseUser,
  };
};
