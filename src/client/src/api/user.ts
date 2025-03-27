import { useQuery } from "@tanstack/react-query";
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

export const useUsers = () =>
  useQuery({
    queryKey: [usersQueryKey],
    queryFn: () => fetchUsers(),
  });
