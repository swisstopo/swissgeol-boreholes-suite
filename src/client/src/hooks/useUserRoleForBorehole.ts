import { useCallback } from "react";
import { Role, SimpleUser, WorkflowStatus } from "@swissgeol/ui-core";
import { Role as LegacyRole, User } from "../api/apiInterfaces.ts";
import { BoreholeV2, useBorehole } from "../api/borehole.ts";
import { useUsers } from "../api/user.ts";
import { useRequiredParams } from "./useRequiredParams.ts";

const CoreRolePriority: Record<Role, number> = {
  Reader: 0,
  Editor: 1,
  Reviewer: 2,
  Publisher: 3,
};

const WorkflowStatusRoleMap: Record<WorkflowStatus, Role | null> = {
  [WorkflowStatus.Draft]: Role.Editor,
  [WorkflowStatus.InReview]: Role.Reviewer,
  [WorkflowStatus.Reviewed]: Role.Reviewer,
  [WorkflowStatus.Published]: Role.Publisher,
};

export const useUserRoleForBorehole = (): {
  getUsersWithEditorPrivilege: () => SimpleUser[];
  canUserEditBorehole: (user: User, borehole: BoreholeV2) => boolean;
} => {
  const { id } = useRequiredParams<{ id: string }>();
  const { data: borehole } = useBorehole(parseInt(id));
  const { data: users } = useUsers();

  const mapMaxRole = (roles?: LegacyRole[]): Role => {
    if (!roles || roles.length === 0) return Role.Reader;
    if (roles.includes(LegacyRole.Publisher)) return Role.Publisher;
    if (roles.includes(LegacyRole.Validator)) return Role.Reviewer;
    if (roles.includes(LegacyRole.Controller)) return Role.Reviewer;
    if (roles.includes(LegacyRole.Editor)) return Role.Editor;
    return Role.Reader;
  };

  const userPrivilegeLevel = useCallback(
    (user?: User) => {
      if (!user) return 0;
      const boreholeWorkgroupId = borehole?.workgroup?.id;
      const userWorkgroupRoles = user?.workgroupRoles?.filter(wgr => wgr.workgroup?.id === boreholeWorkgroupId);
      if (!userWorkgroupRoles || userWorkgroupRoles.length === 0) {
        return 0;
      }
      return CoreRolePriority[mapMaxRole(userWorkgroupRoles.map(wgr => wgr.role))];
    },
    [borehole],
  );

  const hasUserPrivilege = (role: Role, user: User): boolean => {
    return userPrivilegeLevel(user) >= CoreRolePriority[role];
  };

  const canUserEditBorehole = (user: User, borehole: BoreholeV2): boolean => {
    // Todo move check to backend once legacy workflow is removed
    if (!borehole.workflow) return false;
    const requiredRole = WorkflowStatusRoleMap[borehole.workflow.status];
    if (requiredRole === null) return false;
    return hasUserPrivilege(requiredRole, user);
  };

  const getUsersWithEditorPrivilege = (): SimpleUser[] => {
    if (!users) return [];
    return users
      .filter(user => hasUserPrivilege(Role.Editor, user))
      ?.map(user => ({
        ...user,
        role: mapMaxRole(user.workgroupRoles?.map(wgr => wgr.role)),
      }));
  };

  return { canUserEditBorehole, getUsersWithEditorPrivilege };
};
