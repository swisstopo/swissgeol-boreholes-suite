import { User } from "./apiInterfaces.ts";
import { fetchApiV2WithApiError } from "./fetchApiV2";

export const fetchUser = async (id: number) => await fetchApiV2WithApiError(`user/${id}`, "GET");

export const fetchUsers = async () => await fetchApiV2WithApiError("user", "GET");

export const updateUser = async (user: User) => {
  if (user.disabledAt) {
    user.disabledAt = new Date(user.disabledAt).toISOString();
  }
  return await fetchApiV2WithApiError("user", "PUT", user);
};

export const deleteUser = async (id: number) => await fetchApiV2WithApiError(`user/${id}`, "DELETE");
