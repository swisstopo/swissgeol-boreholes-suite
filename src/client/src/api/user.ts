import { User } from "./apiInterfaces.ts";
import { fetchApiV2, fetchApiV2WithApiError } from "./fetchApiV2";

export const fetchCurrentUser = async () => await fetchApiV2("user/self", "GET");

export const fetchUser = async (id: number) => await fetchApiV2(`user/${id}`, "GET");

export const fetchUsers = async () => await fetchApiV2("user", "GET");

export const updateUser = async (user: User) => {
  if (user.disabledAt) {
    user.disabledAt = new Date(user.disabledAt).toISOString();
  }
  return await fetchApiV2WithApiError("user", "PUT", user);
};

export const deleteUser = async (id: number) => await fetchApiV2(`user/${id}`, "DELETE");
