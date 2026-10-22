import { Role } from "@swissgeol/ui-core";
import { Role as LegacyRole, UserWorkgroupRole } from "../../../../api/generated/types.gen";

const workflowRoleByRole: Record<LegacyRole, Role> = {
  View: Role.Reader,
  Editor: Role.Editor,
  Controller: Role.Reviewer,
  Publisher: Role.Publisher,
};

// A user holds one role per workgroup, and only the role in the borehole's workgroup grants rights on it.
export const getWorkflowRoleInWorkgroup = (
  workgroupRoles: UserWorkgroupRole[] | undefined,
  workgroupId: number,
): Role => {
  const role = workgroupRoles?.find(workgroupRole => workgroupRole.workgroupId === workgroupId)?.role;
  return role ? workflowRoleByRole[role] : Role.Reader;
};
