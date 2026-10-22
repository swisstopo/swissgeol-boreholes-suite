import { Role, User, Workgroup } from "../../../api/generated";

export const allRoles: Role[] = ["View", "Editor", "Controller", "Publisher"];

export type WorkgroupWithRole = Workgroup & { role: Role };

export const getWorkgroupsWithRole = (user: User): WorkgroupWithRole[] =>
  (user.workgroupRoles ?? []).flatMap(workgroupRole =>
    // An entry without a role has no value for the role select, and one without a workgroup carries
    // no id for the row to be found by, so neither can be shown.
    workgroupRole.role && workgroupRole.workgroup ? [{ ...workgroupRole.workgroup, role: workgroupRole.role }] : [],
  );

export const getRoleInWorkgroup = (user: User, workgroupId: number): Role | undefined =>
  user.workgroupRoles?.find(workgroupRole => workgroupRole.workgroupId === workgroupId)?.role;
