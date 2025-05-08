import { useMemo } from "react";
import { useSelector } from "react-redux";
import { ReduxRootState } from "../api-lib/ReduxStateInterfaces.ts";
import { Role, RolePriority } from "../api/apiInterfaces.ts";
import { useCurrentUser } from "../api/user.ts";

export const useUserRoleForBorehole = (): {
  hasUserPrivilege: (role: Role) => boolean;
} => {
  const { data: user } = useCurrentUser();
  const borehole = useSelector((state: ReduxRootState) => state.core_borehole);

  const userPrivilegeLevel = useMemo(() => {
    const boreholeWorkgroupId = borehole?.data?.workgroup?.id;

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
