import { FC } from "react";
import { Role, User } from "../../../../api/generated";
import { usersQueryKey, useUsers } from "../../../../api/user.ts";
import { useWorkgroupMutations } from "../../../../api/workgroup.ts";
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

  const addUser = (userId: string, role: Role) => {
    setWorkgroupRoles([{ userId: Number(userId), workgroupId: workgroupId, role: role, isActive: true }]);
  };

  if (!users) return;
  const activeUsers = users.filter(user => !user.isDisabled);
  return (
    <RoleAssignmentDialog<User>
      open={open}
      setOpen={setOpen}
      addEntity={addUser}
      entityType={EntityType.user}
      entities={activeUsers}
      entityQueryKey={usersQueryKey}
    />
  );
};
