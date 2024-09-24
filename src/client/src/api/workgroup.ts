import { Role, Workgroup, WorkgroupRole } from "./apiInterfaces.ts";
import { fetchApiV2 } from "./fetchApiV2";

export const fetchWorkgroups = async () => await fetchApiV2("workgroup", "GET");

export const createWorkgroup = async (workgroup: Workgroup) => await fetchApiV2("workgroup", "POST", workgroup);

export const updateWorkgroup = async (workgroup: Workgroup) => {
  if (workgroup.disabledAt) {
    workgroup.disabledAt = new Date(workgroup.disabledAt).toISOString();
  }
  workgroup.isDisabled = undefined;

  return await fetchApiV2("workgroup", "PUT", workgroup);
};

export const deleteWorkgroup = async (id: number) => await fetchApiV2(`workgroup/${id}`, "DELETE");

export const setRole = async (userId: number, workgroupId: number, role: Role, isActive: boolean) => {
  const workgroupRole: WorkgroupRole = {
    workgroupId: workgroupId,
    userId: userId,
    role: role,
    isActive: isActive,
  };
  return await fetchApiV2("workgroup/setRole", "POST", workgroupRole);
};
