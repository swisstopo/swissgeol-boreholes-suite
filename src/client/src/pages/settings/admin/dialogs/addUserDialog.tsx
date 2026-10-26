import { FC } from "react";
import { Role } from "../../../../api/generated";
import { usersQueryKey, useUsers } from "../../../../api/user.ts";
import { useWorkgroupMutations } from "../../../../api/workgroup.ts";
import { getRoleInWorkgroup } from "../workgroupRoles.ts";
import { EntityType } from "./entityType.ts";
import { RoleAssignmentDialog } from "./roleAssignmentDialog.tsx";

interface AddUserDialogProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  workgroupId: number;
}

export const AddUserDialog: FC<AddUserDialogProps> = ({ open, setOpen, workgroupId }) => {
  const { data: users } = useUsers();
  const {
    setWorkgroupRoles: { mutate: setWorkgroupRoles },
  } = useWorkgroupMutations();

  const addUsers = (userIds: number[], role: Role) => {
    setWorkgroupRoles(userIds.map(userId => ({ userId, workgroupId, role, isActive: true })));
  };

  if (!users) return;
  const userOptions = users
    .filter(user => !user.isDisabled && !getRoleInWorkgroup(user, workgroupId))
    .map(user => ({ id: user.id, label: `${user.firstName} ${user.lastName}` }));
  return (
    <RoleAssignmentDialog
      open={open}
      setOpen={setOpen}
      addEntities={addUsers}
      entityType={EntityType.user}
      options={userOptions}
      entityQueryKey={usersQueryKey}
    />
  );
};
