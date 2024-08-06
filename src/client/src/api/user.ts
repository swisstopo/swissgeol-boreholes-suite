import { fetchApiV2 } from "./fetchApiV2";
import { User } from "./apiInterfaces.ts";

export const fetchCurrentUser = async () => await fetchApiV2("user/self", "GET");

export const fetchUser = async (id: number) => await fetchApiV2(`user/${id}`, "GET");

export const fetchUsers = async () => await fetchApiV2("user", "GET");

export const updateUser = async (user: User) => {
  if (user.disabledAt) {
    user.disabledAt = new Date(user.disabledAt).toISOString();
  }
  user.isDisabled = undefined;
  user.acceptedTerms = undefined;
  user.workgroupRoles = undefined;

  return await fetchApiV2("user", "PUT", user);
};

export const deleteUser = async (id: number) => await fetchApiV2(`user/${id}`, "DELETE");
