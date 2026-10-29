import { Role } from "@swissgeol/ui-core";
import { User, UserWorkgroupRole } from "../../../../api/generated";

type WorkflowUser = Pick<User, "isAdmin" | "workgroupRoles">;

// A user holds one role per workgroup, and only the role in the borehole's workgroup grants rights on it.
export const getWorkflowRoleInWorkgroup = (
  workgroupRoles: UserWorkgroupRole[] | undefined,
  workgroupId: number,
): Role => {
  const role = workgroupRoles?.find(workgroupRole => workgroupRole.workgroupId === workgroupId)?.role;
  return role ? Role[role] : Role.Reader;
};

// Every editor of the workgroup can view the status, also in statuses they cannot change.
export const canViewWorkflow = (user: WorkflowUser | undefined, workgroupId: number): boolean =>
  user?.isAdmin === true || getWorkflowRoleInWorkgroup(user?.workgroupRoles, workgroupId) !== Role.Reader;

export const canPublishInWorkgroup = (user: WorkflowUser | undefined, workgroupId: number): boolean =>
  user?.isAdmin === true || getWorkflowRoleInWorkgroup(user?.workgroupRoles, workgroupId) === Role.Publisher;
