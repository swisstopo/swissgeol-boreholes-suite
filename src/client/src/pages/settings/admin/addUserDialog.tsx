import { FC, useContext, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { Role, User, WorkgroupRole } from "../../../api/apiInterfaces.ts";
import { fetchUsers } from "../../../api/user.ts";
import { setWorkgroupRole } from "../../../api/workgroup.ts";
import { AddButton, CancelButton } from "../../../components/buttons/buttons";
import { useApiRequest } from "../../../hooks/useApiRequest.ts";
import { UserAdministrationContext } from "./userAdministrationContext.tsx";

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
  const { t } = useTranslation();
  const [userId, setUserId] = useState<string | null>(null);
  const [role, setRole] = useState<Role | null>(null);
  const { users, setUsers } = useContext(UserAdministrationContext);
  const { callApiWithErrorHandling, callApiWithRollback } = useApiRequest();

  useEffect(() => {
    const getUsers = async () => {
      const users: User[] = await callApiWithErrorHandling(fetchUsers, []);
      if (!users) {
        setOpen(false);
      } else {
        setUsers(users);
      }
    };
    getUsers();
  }, [callApiWithErrorHandling, setOpen, setUsers]);

  const resetDialog = () => {
    setOpen(false);
    setUserId(null);
    setRole(null);
  };

  const updateUsersTableWithNewRole = (userId: number, role: Role) => {
    const workgroupRole: WorkgroupRole = {
      userId,
      workgroupId,
      role,
      isActive: true,
    };
    setWorkgroupUsers(
      workgroupUsers.map(user => {
        if (user.id === userId) {
          return {
            ...user,
            workgroupRoles: user.workgroupRoles ? [...user.workgroupRoles, workgroupRole] : [workgroupRole],
          };
        }
        return user;
      }),
    );
  };

  const addUser = async () => {
    if (userId && role) {
      resetDialog();

      const rollback = () => {
        setWorkgroupUsers([...workgroupUsers]);
      };

      updateUsersTableWithNewRole(parseInt(userId), role);

      await callApiWithRollback(setWorkgroupRole, [userId, workgroupId, role, true], rollback);
    }
  };

  return (
    <Dialog open={open}>
      <Stack sx={{ minWidth: "326px" }}>
        <DialogTitle>
          <Typography variant="h4">{t("addUserRole")}</Typography>
        </DialogTitle>
        <DialogContent>
          <Stack gap={2} sx={{ mt: 3 }}>
            <TextField
              select
              label={t("user")}
              name={"user"}
              value={userId}
              data-cy="user-formSelect"
              onChange={event => {
                setUserId(event.target.value);
              }}>
              {users.map(usr => (
                <MenuItem key={usr.id} value={usr.id}>
                  {`${usr.firstName} ${usr.lastName}`}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              select
              label={t("role")}
              name={"role"}
              value={role}
              data-cy="role-formSelect"
              onChange={event => {
                setRole(event.target.value as Role);
              }}>
              {Object.values(Role).map(role => (
                <MenuItem key={role} value={role}>
                  {role}
                </MenuItem>
              ))}
            </TextField>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Stack direction="row" justifyContent="flex-end" spacing={2}>
            <CancelButton onClick={resetDialog} />
            <AddButton disabled={!userId || !role} label="add" variant="contained" onClick={addUser} />
          </Stack>
        </DialogActions>
      </Stack>
    </Dialog>
  );
};
