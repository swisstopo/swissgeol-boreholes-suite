import { useMemo } from "react";
import { Role, RolePriority } from "../api/apiInterfaces.ts";
import { useBorehole } from "../api/borehole.ts";
import { useCurrentUser } from "../api/user.ts";
import { useRequiredParams } from "./useRequiredParams.ts";

export const useUserRoleForBorehole = (): {
  hasUserPrivilege: (role: Role) => boolean;
} => {
  const { data: user } = useCurrentUser();
  const { id } = useRequiredParams<{ id: string }>();
  const { data: borehole } = useBorehole(parseInt(id));

  const userPrivilegeLevel = useMemo(() => {
    const boreholeWorkgroupId = borehole?.workgroup?.id;
    const userWorkgroupRoles = user?.workgroupRoles?.filter(wgr => wgr.workgroup?.id === boreholeWorkgroupId);
    if (!userWorkgroupRoles || userWorkgroupRoles.length === 0) {
      return null;
    }
    return Math.max(...userWorkgroupRoles.map(workgroupRole => RolePriority[workgroupRole.role]));
  }, [user, borehole]);

  const hasUserPrivilege = (role: Role): boolean => {
    if (userPrivilegeLevel === null) return false;
    return userPrivilegeLevel >= RolePriority[role];
  };

  return { hasUserPrivilege };
};
