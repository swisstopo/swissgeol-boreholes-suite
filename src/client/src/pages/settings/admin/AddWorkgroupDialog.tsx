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
  shouldUserUpdate: boolean;
  setShouldUserUpdate: (shouldUserUpdate: boolean) => void;
}

export const AddWorkgroupDialog: FC<AddWorkgroupDialogProps> = ({
  open,
  setOpen,
  userId,
  shouldUserUpdate,
  setShouldUserUpdate,
}) => {
  const { t } = useTranslation();
  const [workgroups, setWorkgroups] = useState<Workgroup[]>([]);
  const [workgroupId, setWorkgroupId] = useState<string | null>(null);
  const [role, setRole] = useState<Role | null>(null);
  const { callApiWithErrorHandling, callApiWithRollback } = useApiRequest();

  const addWorkgroup = async () => {
    if (workgroupId && role) {
      const rollback = () => {
        setWorkgroupId(null);
        console.log("rollback");

        setRole(null);
      };
      await callApiWithRollback(setWorkgroupRole, [userId, workgroupId, role, true], rollback);
      setOpen(false);
      setShouldUserUpdate(!shouldUserUpdate);
      setWorkgroupId(null);
      setRole(null);
      // update workgroup table!
    }
  };

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

  return (
    <Dialog open={open}>
      <Stack sx={{ minWidth: "326px" }}>
        <DialogTitle>
          <Typography variant="h4">{t("addWorkgroup")}</Typography>
        </DialogTitle>
        <DialogContent>
          <Stack gap={1} sx={{ mt: 3 }}>
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
            <CancelButton
              onClick={() => {
                setWorkgroupId(null);
                setRole(null);
                setOpen(false);
              }}
            />
            <AddButton
              disabled={!workgroupId || !role}
              label="addWorkgroup"
              variant="contained"
              onClick={addWorkgroup}
            />
          </Stack>
        </DialogActions>
      </Stack>
    </Dialog>
  );
};
