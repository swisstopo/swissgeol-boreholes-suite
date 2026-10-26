import { FC } from "react";
import { Role, User } from "../../../../api/generated";
import { useWorkgroupMutations, useWorkgroups, workgroupQueryKey } from "../../../../api/workgroup.ts";
import { getRoleInWorkgroup } from "../workgroupRoles.ts";
import { EntityType } from "./entityType.ts";
import { RoleAssignmentDialog } from "./roleAssignmentDialog.tsx";

interface AddWorkgroupRoleDialogProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  user: User;
}

export const AddWorkgroupRoleDialog: FC<AddWorkgroupRoleDialogProps> = ({ open, setOpen, user }) => {
  const { data: workgroups } = useWorkgroups();
  const {
    setWorkgroupRoles: { mutate: setWorkgroupRoles },
  } = useWorkgroupMutations();

  const addWorkgroups = (workgroupIds: number[], role: Role) => {
    setWorkgroupRoles(workgroupIds.map(workgroupId => ({ userId: user.id, workgroupId, role, isActive: true })));
  };

  if (!workgroups) return;
  const workgroupOptions = workgroups
    .filter(workgroup => !workgroup.isDisabled && !getRoleInWorkgroup(user, workgroup.id))
    .map(workgroup => ({ id: workgroup.id, label: workgroup.name }));
  return (
    <RoleAssignmentDialog
      open={open}
      setOpen={setOpen}
      entityQueryKey={workgroupQueryKey}
      addEntities={addWorkgroups}
      entityType={EntityType.workgroup}
      options={workgroupOptions}
    />
  );
};
