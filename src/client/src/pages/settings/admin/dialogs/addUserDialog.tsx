import { FC, useContext } from "react";
import { EntityType, Role, User, WorkgroupRole } from "../../../../api/apiInterfaces.ts";
import { fetchUsers } from "../../../../api/user.ts";
import { setWorkgroupRole } from "../../../../api/workgroup.ts";
import { useApiRequest } from "../../../../hooks/useApiRequest.ts";
import { UserAdministrationContext } from "../userAdministrationContext.tsx";
import { RoleAssignmentDialog } from "./roleAssignmentDialog.tsx";

interface AddUserDialogProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  workgroupId: number;
  workgroupUsers: User[];
  setWorkgroupUsers: (users: User[]) => void;
}

export const AddUserDialog: FC<AddUserDialogProps> = ({
  open,
  setOpen,
  workgroupId,
  workgroupUsers,
  setWorkgroupUsers,
}) => {
  const { users, setUsers } = useContext(UserAdministrationContext);
  const { callApiWithRollback } = useApiRequest();

  const addRoleToExistingUser = (userId: number, newWorkgroupRole: WorkgroupRole) => {
    const newWorkgroupUsers = workgroupUsers.map(user => {
      if (user.id === userId) {
        return {
          ...user,
          workgroupRoles: user.workgroupRoles ? [...user.workgroupRoles, newWorkgroupRole] : [newWorkgroupRole],
        };
      }
      return user;
    });
    setWorkgroupUsers([...newWorkgroupUsers]);
  };

  const addNewUserToWorkgroup = (userId: number, newWorkgroupRole: WorkgroupRole) => {
    const newUser = users.find(usr => usr.id === userId);
    if (newUser) {
      newUser.workgroupRoles = [newWorkgroupRole];
      setWorkgroupUsers([...workgroupUsers, newUser]);
    }
  };

  const updateUsersTableWithNewRole = (userId: number, role: Role) => {
    const existingWorkgroupUser = workgroupUsers.find(user => user.id === userId);
    const newWorkgroupRole: WorkgroupRole = {
      userId,
      workgroupId,
      role,
      isActive: true,
    };
    if (existingWorkgroupUser) {
      addRoleToExistingUser(userId, newWorkgroupRole);
    } else {
      addNewUserToWorkgroup(userId, newWorkgroupRole);
    }
  };

  const addUser = async (userId: string, role: Role) => {
    const rollback = () => {
      setWorkgroupUsers([...workgroupUsers]);
    };

    updateUsersTableWithNewRole(parseInt(userId), role);

    await callApiWithRollback(setWorkgroupRole, [userId, workgroupId, role, true], rollback);
  };

  return (
    <RoleAssignmentDialog<User>
      open={open}
      setOpen={setOpen}
      fetchFunction={fetchUsers}
      addEntity={addUser}
      entityType={EntityType.user}
      entities={users}
      setEntities={setUsers}
    />
  );
};
