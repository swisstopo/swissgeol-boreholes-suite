import { Role } from "@swissgeol/ui-core";
import { UserWorkgroupRole } from "../../../../api/generated/types.gen";

// A user holds one role per workgroup, and only the role in the borehole's workgroup grants rights on it.
export const getWorkflowRoleInWorkgroup = (
  workgroupRoles: UserWorkgroupRole[] | undefined,
  workgroupId: number,
): Role => {
  const role = workgroupRoles?.find(workgroupRole => workgroupRole.workgroupId === workgroupId)?.role;
  return role ? Role[role] : Role.Reader;
};
