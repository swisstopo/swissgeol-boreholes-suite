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
