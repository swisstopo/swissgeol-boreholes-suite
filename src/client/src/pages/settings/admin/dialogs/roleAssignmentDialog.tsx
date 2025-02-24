import { useEffect, useState } from "react";
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
import { EntityType, Role, User, Workgroup } from "../../../../api/apiInterfaces.ts";
import { AddButton, CancelButton } from "../../../../components/buttons/buttons.tsx";
import { useApiRequest } from "../../../../hooks/useApiRequest.ts";

interface RoleAssignmentDialogProps<T> {
  open: boolean;
  setOpen: (open: boolean) => void;
  fetchFunction: () => Promise<T[]>;
  addEntity: (id: string, role: Role) => Promise<void>;
  entityType: EntityType;
  entities: T[];
  setEntities: (entities: T[]) => void;
}

export const RoleAssignmentDialog = <T,>({
  open,
  setOpen,
  fetchFunction,
  addEntity,
  entityType,
  entities,
  setEntities,
}: RoleAssignmentDialogProps<T>) => {
  const { t } = useTranslation();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [role, setRole] = useState<Role | null>(null);
  const { callApiWithErrorHandling } = useApiRequest();

  useEffect(() => {
    const getEntities = async () => {
      const results: T[] = await callApiWithErrorHandling(fetchFunction, []);
      if (!results) {
        setOpen(false);
      } else {
        setEntities(results);
      }
    };
    getEntities();
  }, [callApiWithErrorHandling, setOpen, setEntities, fetchFunction]);

  const resetDialog = () => {
    setOpen(false);
    setSelectedId(null);
    setRole(null);
  };

  const getEntityMenuItem = (entity: T) => {
    if (entityType === EntityType.workgroup) {
      const workgroup = entity as Workgroup;
      return (
        <MenuItem key={workgroup.id} value={workgroup.id}>
          {workgroup.name}
        </MenuItem>
      );
    } else {
      const user = entity as User;
      return (
        <MenuItem key={user.id} value={user.id}>
          {`${user.firstName} ${user.lastName}`}
        </MenuItem>
      );
    }
  };

  const addRole = async () => {
    if (selectedId && role) {
      resetDialog();
      await addEntity(selectedId, role);
    }
  };

  return (
    <Dialog open={open}>
      <Stack sx={{ minWidth: "326px" }}>
        <DialogTitle>
          <Typography variant="h4">{t(`add${entityType}Role`)}</Typography>
        </DialogTitle>
        <DialogContent>
          <Stack gap={2} sx={{ mt: 3 }}>
            <TextField
              select
              label={t(entityType)}
              name={entityType}
              value={selectedId}
              data-cy={`${entityType.toLowerCase()}-formSelect`}
              onChange={event => {
                setSelectedId(event.target.value);
              }}>
              {entities.map(entity => getEntityMenuItem(entity))}
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
            <AddButton disabled={!selectedId || !role} label="add" variant="contained" onClick={addRole} />
          </Stack>
        </DialogActions>
      </Stack>
    </Dialog>
  );
};
