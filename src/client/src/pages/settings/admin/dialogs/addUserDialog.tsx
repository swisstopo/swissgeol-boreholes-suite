import { FC } from "react";
import { EntityType, Role, User } from "../../../../api/apiInterfaces.ts";
import { usersQueryKey, useUsers } from "../../../../api/user.ts";
import { useWorkgroupMutations } from "../../../../api/workgroup.ts";
import { RoleAssignmentDialog } from "./roleAssignmentDialog.tsx";

interface AddUserDialogProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  workgroupId: number;
}

export const AddUserDialog: FC<AddUserDialogProps> = ({ open, setOpen, workgroupId }) => {
  const { data: users } = useUsers();
  const {
    setWorkgroupRole: { mutate: setWorkgroupRole },
  } = useWorkgroupMutations();

  const addUser = async (userId: string, role: Role) => {
    setWorkgroupRole({ userId: Number(userId), workgroupId: workgroupId, role: role, isActive: true });
  };

  if (!users) return;
  return (
    <RoleAssignmentDialog<User>
      open={open}
      setOpen={setOpen}
      addEntity={addUser}
      entityType={EntityType.user}
      entities={users}
      entityQueryKey={usersQueryKey}
    />
  );
};
