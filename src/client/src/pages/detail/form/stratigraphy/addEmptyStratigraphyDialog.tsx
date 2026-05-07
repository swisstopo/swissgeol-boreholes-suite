import { FC, useState } from "react";
import { useTranslation } from "react-i18next";
import { Dialog, DialogActions, DialogContent, DialogTitle, Stack, TextField, Typography } from "@mui/material";
import { useQueryClient } from "@tanstack/react-query";
import { ApiError } from "../../../../api/apiInterfaces.ts";
import { stratigraphiesQueryKey, Stratigraphy, useStratigraphyMutations } from "../../../../api/stratigraphy.ts";
import { BoreholesButton, CancelButton } from "../../../../components/buttons/buttons.tsx";
import { getFieldBorderColor } from "../../../../components/form/formUtils.ts";
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
  // Local saving flag covers both the POST and the follow-up refetch — `isPending` from
  // the mutation flips back to false the moment the POST resolves, which would unblock
  // the buttons during the await for `invalidateQueries` and cause a visible flicker.
  const [isSaving, setIsSaving] = useState(false);
  const { t } = useTranslation();
  const showApiErrorAlert = useApiErrorAlert();
  const queryClient = useQueryClient();
  const {
    add: { mutateAsync: addStratigraphy },
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
    setIsSaving(true);
    try {
      const created = await addStratigraphy(payload);
      // Wait for the stratigraphies refetch so the parent re-renders with the new entry
      // before we navigate; otherwise the panel's redirect-to-primary effect runs on stale data.
      await queryClient.invalidateQueries({ queryKey: [stratigraphiesQueryKey, boreholeId] });
      onCreated(created.id);
      resetAndClose();
    } catch (error) {
      if (error instanceof ApiError && error.message.includes("Name must be unique")) {
        setNameError(t("mustBeUnique"));
      } else {
        showApiErrorAlert(error);
      }
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={open} data-cy="add-empty-stratigraphy-dialog">
      <Stack sx={{ width: "560px" }}>
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
              sx={getFieldBorderColor(false)}
              onChange={event => {
                setName(event.target.value);
                if (nameError) setNameError(null);
              }}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Stack direction="row" justifyContent="flex-end" spacing={2}>
            <CancelButton onClick={resetAndClose} disabled={isSaving} />
            <BoreholesButton
              label="addEmptyStratigraphy"
              variant="contained"
              dataCy="addemptystratigraphy-submit-button"
              disabled={!trimmedName || isSaving}
              onClick={handleSave}
            />
          </Stack>
        </DialogActions>
      </Stack>
    </Dialog>
  );
};
