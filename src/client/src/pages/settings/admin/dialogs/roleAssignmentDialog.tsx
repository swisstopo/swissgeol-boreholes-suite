import { FC, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  ListItemText,
  MenuItem,
  Select,
  SelectChangeEvent,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { useQueryClient } from "@tanstack/react-query";
import { Role } from "../../../../api/generated";
import { AddButton, CancelButton } from "../../../../components/buttons/buttons.tsx";
import { allRoles } from "../workgroupRoles.ts";
import { EntityType } from "./entityType.ts";

export interface EntityOption {
  id: number;
  label: string;
}

const selectAllValue = "selectAll";
type EntitySelectValue = number | typeof selectAllValue;

interface RoleAssignmentDialogProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  addEntities: (ids: number[], role: Role) => void;
  entityType: EntityType;
  options: EntityOption[];
  entityQueryKey: string;
}

export const RoleAssignmentDialog: FC<RoleAssignmentDialogProps> = ({
  open,
  setOpen,
  addEntities,
  entityType,
  options,
  entityQueryKey,
}) => {
  const { t } = useTranslation();
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [role, setRole] = useState<Role | null>(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    // Not awaited: effects cannot be async, and the dialog renders from the query cache.
    void queryClient.invalidateQueries({
      queryKey: [entityQueryKey],
    });
  }, [entityQueryKey, queryClient]);

  const allSelected = options.length > 0 && selectedIds.length === options.length;
  const someSelected = selectedIds.length > 0 && !allSelected;
  const selectLabelId = `${entityType}-select-label`;

  const resetDialog = () => {
    setOpen(false);
    setSelectedIds([]);
    setRole(null);
  };

  const handleEntityChange = (event: SelectChangeEvent<EntitySelectValue[]>) => {
    const { value } = event.target;
    // A string value only comes from browser autofill, which this select does not offer.
    if (typeof value === "string") return;
    if (value.includes(selectAllValue)) {
      setSelectedIds(allSelected ? [] : options.map(option => option.id));
      return;
    }
    setSelectedIds(value.filter((selected): selected is number => selected !== selectAllValue));
  };

  const renderSelectedLabels = (selected: EntitySelectValue[]) =>
    options
      .filter(option => selected.includes(option.id))
      .map(option => option.label)
      .join(", ");

  const addRole = () => {
    if (selectedIds.length > 0 && role) {
      resetDialog();
      addEntities(selectedIds, role);
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
            <FormControl data-cy={`${entityType.toLowerCase()}-formSelect`}>
              <InputLabel id={selectLabelId}>{t(entityType)}</InputLabel>
              <Select<EntitySelectValue[]>
                multiple
                labelId={selectLabelId}
                label={t(entityType)}
                name={entityType}
                value={selectedIds}
                onChange={handleEntityChange}
                renderValue={renderSelectedLabels}>
                {options.length > 0 && (
                  <MenuItem value={selectAllValue} data-cy="selectAll">
                    <Checkbox checked={allSelected} indeterminate={someSelected} />
                    <ListItemText primary={t("selectAll")} />
                  </MenuItem>
                )}
                {options.map(option => (
                  <MenuItem key={option.id} value={option.id}>
                    <Checkbox checked={selectedIds.includes(option.id)} />
                    <ListItemText primary={option.label} />
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              select
              label={t("role")}
              name={"role"}
              value={role}
              data-cy="role-formSelect"
              onChange={event => {
                setRole(event.target.value as Role);
              }}>
              {allRoles.map(role => (
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
            <AddButton disabled={selectedIds.length === 0 || !role} label="add" variant="contained" onClick={addRole} />
          </Stack>
        </DialogActions>
      </Stack>
    </Dialog>
  );
};
