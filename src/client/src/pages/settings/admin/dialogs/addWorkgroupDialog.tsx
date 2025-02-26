import { FC, useContext } from "react";
import { EntityType, Role, Workgroup } from "../../../../api/apiInterfaces.ts";
import { fetchWorkgroups, setWorkgroupRole } from "../../../../api/workgroup.ts";
import { useApiRequest } from "../../../../hooks/useApiRequest.ts";
import { WorkgroupAdministrationContext } from "../workgroupAdministrationContext.tsx";
import { RoleAssignmentDialog } from "./roleAssignmentDialog.tsx";

interface AddWorkgroupDialogProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  userId: string;
  userWorkgroups: Workgroup[];
  setUserWorkgroups: (userWorkgroups: Workgroup[]) => void;
}

export const AddWorkgroupDialog: FC<AddWorkgroupDialogProps> = ({
  open,
  setOpen,
  userId,
  userWorkgroups,
  setUserWorkgroups,
}) => {
  const { workgroups, setWorkgroups } = useContext(WorkgroupAdministrationContext);
  const { callApiWithRollback } = useApiRequest();

  const addRoleToExistingWorkgroup = (workgroupId: number, role: Role) => {
    setUserWorkgroups(
      userWorkgroups.map(workgroup => {
        if (workgroup.id === workgroupId) {
          return {
            ...workgroup,
            roles: workgroup.roles ? [...workgroup.roles, role] : [role],
          };
        }
        return workgroup;
      }),
    );
  };

  const addNewWorkgroupToUser = (workgroupId: number, role: Role) => {
    const newWorkgroup = workgroups.find(wgp => wgp.id === workgroupId);
    if (newWorkgroup) {
      newWorkgroup.roles = [role];
      setUserWorkgroups([...userWorkgroups, newWorkgroup]);
    }
  };

  const updateWorkgroupsTableWithNewRole = (workgroupId: number, role: Role) => {
    const existingUserWorkgroup = userWorkgroups.find(wgp => wgp.id === workgroupId);
    if (existingUserWorkgroup) {
      addRoleToExistingWorkgroup(workgroupId, role);
    } else {
      addNewWorkgroupToUser(workgroupId, role);
    }
  };

  const addWorkgroup = async (workgroupId: string, role: Role) => {
    const rollback = () => {
      setUserWorkgroups([...userWorkgroups]);
    };

    updateWorkgroupsTableWithNewRole(parseInt(workgroupId), role);

    await callApiWithRollback(setWorkgroupRole, [userId, workgroupId, role, true], rollback);
  };

  return (
    <RoleAssignmentDialog<Workgroup>
      open={open}
      setOpen={setOpen}
      fetchFunction={fetchWorkgroups}
      addEntity={addWorkgroup}
      entityType={EntityType.workgroup}
      entities={workgroups}
      setEntities={setWorkgroups}
    />
  );
};
