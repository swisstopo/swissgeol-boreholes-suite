import { FC, useState } from "react";
import { useTranslation } from "react-i18next";
import { Dialog, DialogActions, DialogContent, DialogTitle, Stack, TextField, Typography } from "@mui/material";
import { ApiError } from "../../../../api/apiInterfaces.ts";
import { Stratigraphy, useStratigraphyMutations } from "../../../../api/stratigraphy.ts";
import { AddButton, CancelButton } from "../../../../components/buttons/buttons.tsx";
import { useApiErrorAlert } from "../../../../hooks/useShowAlertOnError.tsx";

interface AddEmptyStratigraphyDialogProps {
  open: boolean;
  onClose: () => void;
  boreholeId: number;
  isFirstStratigraphy: boolean;
  onCreated: (id: number) => void;
}

export const AddEmptyStratigraphyDialog: FC<AddEmptyStratigraphyDialogProps> = ({
  open,
  onClose,
  boreholeId,
  isFirstStratigraphy,
  onCreated,
}) => {
  const [name, setName] = useState("");
  const [nameError, setNameError] = useState<string | null>(null);
  const { t } = useTranslation();
  const showApiErrorAlert = useApiErrorAlert();
  const {
    add: { mutateAsync: addStratigraphy, isPending },
  } = useStratigraphyMutations();

  const trimmedName = name.trim();

  const resetAndClose = () => {
    setName("");
    setNameError(null);
    onClose();
  };

  const handleSave = async () => {
    if (!trimmedName) return;
    const payload: Stratigraphy = {
      id: 0,
      boreholeId,
      borehole: null,
      name: trimmedName,
      date: null,
      isPrimary: isFirstStratigraphy,
      created: null,
      createdById: null,
      updated: null,
      updatedById: null,
      lithologies: null,
      chronostratigraphyLayers: null,
      lithostratigraphyLayers: null,
    };
    try {
      const created = await addStratigraphy(payload);
      onCreated(created.id);
      resetAndClose();
    } catch (error) {
      if (error instanceof ApiError && error.message.includes("Name must be unique")) {
        setNameError(t("mustBeUnique"));
      } else {
        showApiErrorAlert(error);
      }
    }
  };

  return (
    <Dialog open={open} data-cy="add-empty-stratigraphy-dialog">
      <Stack sx={{ minWidth: "326px" }}>
        <DialogTitle>
          <Typography variant="h4">{t("addEmptyStratigraphy")}</Typography>
        </DialogTitle>
        <DialogContent>
          <Stack gap={2} sx={{ mt: 3 }}>
            <TextField
              required
              label={t("name")}
              name="stratigraphyName"
              value={name}
              error={!!nameError}
              helperText={nameError ?? undefined}
              data-cy="stratigraphy-name-formInput"
              onChange={event => {
                setName(event.target.value);
                if (nameError) setNameError(null);
              }}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Stack direction="row" justifyContent="flex-end" spacing={2}>
            <CancelButton onClick={resetAndClose} disabled={isPending} />
            <AddButton
              label="addEmptyStratigraphy"
              variant="contained"
              dataCy="addemptystratigraphy-submit-button"
              disabled={!trimmedName || isPending}
              onClick={handleSave}
            />
          </Stack>
        </DialogActions>
      </Stack>
    </Dialog>
  );
};
