import { FC, useEffect, useState } from "react";
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
import { Role, Workgroup } from "../../../api/apiInterfaces.ts";
import { fetchWorkgroups, setWorkgroupRole } from "../../../api/workgroup.ts";
import { AddButton, CancelButton } from "../../../components/buttons/buttons";
import { useApiRequest } from "../../../hooks/useApiRequest.ts";

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
  const { t } = useTranslation();
  const [workgroups, setWorkgroups] = useState<Workgroup[]>([]);
  const [workgroupId, setWorkgroupId] = useState<string | null>(null);
  const [role, setRole] = useState<Role | null>(null);
  const { callApiWithErrorHandling, callApiWithRollback } = useApiRequest();

  useEffect(() => {
    const getWorkgroups = async () => {
      const workgroups: Workgroup[] = await callApiWithErrorHandling(fetchWorkgroups, []);
      if (!workgroups) {
        setOpen(false);
      } else {
        setWorkgroups(workgroups);
      }
    };
    getWorkgroups();
  }, [callApiWithErrorHandling, setOpen]);

  const resetDialog = () => {
    setOpen(false);
    setWorkgroupId(null);
    setRole(null);
  };

  const updateWorkgroupsTableWithNewRole = (workgroupId: number, role: Role) => {
    const existingUserWorkgroup = userWorkgroups.find(wgp => wgp.id === workgroupId);
    if (existingUserWorkgroup) {
      setUserWorkgroups([{ ...existingUserWorkgroup, roles: [...existingUserWorkgroup.roles, role] }]);
    } else {
      const newWorkgroup = workgroups.find(wgp => wgp.id === workgroupId);
      if (newWorkgroup) {
        newWorkgroup.roles = [role];
        setUserWorkgroups([...userWorkgroups, newWorkgroup]);
      }
    }
  };

  const addWorkgroup = async () => {
    if (workgroupId && role) {
      resetDialog();

      const rollback = () => {
        setUserWorkgroups([...userWorkgroups]);
      };

      updateWorkgroupsTableWithNewRole(parseInt(workgroupId), role);

      await callApiWithRollback(setWorkgroupRole, [userId, workgroupId, role, true], rollback);
    }
  };

  return (
    <Dialog open={open}>
      <Stack sx={{ minWidth: "326px" }}>
        <DialogTitle>
          <Typography variant="h4">{t("addWorkgroup")}</Typography>
        </DialogTitle>
        <DialogContent>
          <Stack gap={2} sx={{ mt: 3 }}>
            <TextField
              select
              label={t("workgroup")}
              name={"workgroup"}
              value={workgroupId}
              onChange={event => {
                setWorkgroupId(event.target.value);
              }}>
              {workgroups.map(wgp => (
                <MenuItem key={wgp.id} value={wgp.id}>
                  {wgp.name}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              select
              label={t("role")}
              name={"role"}
              value={role}
              onChange={event => {
                setRole(event.target.value as Role);
              }}>
              {Object.values(Role).map((role, index) => (
                <MenuItem key={index} value={role}>
                  {role}
                </MenuItem>
              ))}
            </TextField>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Stack direction="row" justifyContent="flex-end" spacing={2}>
            <CancelButton onClick={resetDialog} />
            <AddButton
              disabled={!workgroupId || !role}
              label="addWorkgroupRole"
              variant="contained"
              onClick={addWorkgroup}
            />
          </Stack>
        </DialogActions>
      </Stack>
    </Dialog>
  );
};
