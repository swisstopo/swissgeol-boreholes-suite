import { FC, useContext, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Dialog, DialogActions, DialogContent, DialogTitle, Stack, TextField, Typography } from "@mui/material";
import { Workgroup } from "../../../../api/apiInterfaces.ts";
import { useWorkgroupMutations } from "../../../../api/workgroup.ts";
import { AlertContext } from "../../../../components/alert/alertContext.tsx";
import { AddButton, CancelButton } from "../../../../components/buttons/buttons.tsx";
import { useShowAlertOnError } from "../../../../hooks/useShowAlertOnError.ts";

interface AddWorkgroupDialogProps {
  open: boolean;
  setOpen: (open: boolean) => void;
}

export const AddWorkgroupDialog: FC<AddWorkgroupDialogProps> = ({ open, setOpen }) => {
  const [workgroupName, setWorkgroupName] = useState<string | null>(null);
  const { showAlert } = useContext(AlertContext);
  const { t } = useTranslation();

  const {
    add: { mutate: add, isError, error, isSuccess },
  } = useWorkgroupMutations();

  const addWorkgroup = async () => {
    if (!workgroupName) return;
    const workgroup: Workgroup = {
      id: 0,
      name: workgroupName,
      boreholeCount: 0,
    };

    add(workgroup);
  };

  useShowAlertOnError(isError, error);
  useEffect(() => {
    if (isSuccess && workgroupName) {
      showAlert(t("workgroupWithNameAdded", { name: workgroupName }), "success");
      setWorkgroupName(null);
      setOpen(false);
    }
  }, [setOpen, workgroupName, isSuccess, showAlert, t]);

  return (
    <Dialog open={open}>
      <Stack sx={{ minWidth: "326px" }}>
        <DialogTitle>
          <Typography variant="h4">{t(`addWorkgroup`)}</Typography>
        </DialogTitle>
        <DialogContent>
          <Stack gap={2} sx={{ mt: 3 }}>
            <TextField
              required
              label={t("name")}
              name={"workgroupName"}
              value={workgroupName}
              data-cy={"workgroup-formInput"}
              onChange={event => {
                setWorkgroupName(event.target.value);
              }}></TextField>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Stack direction="row" justifyContent="flex-end" spacing={2}>
            <CancelButton onClick={() => setOpen(false)} />
            <AddButton disabled={!workgroupName} label="add" variant="contained" onClick={addWorkgroup} />
          </Stack>
        </DialogActions>
      </Stack>
    </Dialog>
  );
};
