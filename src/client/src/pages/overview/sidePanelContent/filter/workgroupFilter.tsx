import { FC } from "react";
import { useTranslation } from "react-i18next";
import { Box, Button, Stack } from "@mui/material";
import { Workgroup } from "../../../../api-lib/ReduxStateInterfaces.ts";

interface WorkgroupFilterProps {
  selectedWorkgroupIds?: number[];
  onChange: (value: number[] | null) => void;
  workgroups: Workgroup[];
  counts?: Record<number, number>;
}
export const WorkgroupFilter: FC<WorkgroupFilterProps> = ({ selectedWorkgroupIds, onChange, workgroups, counts }) => {
  const { t } = useTranslation();
  const selected = selectedWorkgroupIds ?? [];
  const toggle = (id: number) => {
    const next = selected.includes(id) ? selected.filter(k => k !== id) : [...selected, id];
    onChange(next.length === 0 ? null : next);
  };

  return (
    <Box data-cy={`workgroup-formSelect`}>
      <Stack direction="row" flexWrap="wrap" gap={0.5}>
        {workgroups.map(workgroup => {
          const isSelected = selected.includes(workgroup.id);
          const count = counts?.[workgroup.id] ?? 0;
          const hasCount = counts !== undefined;
          // Disable when count information is available and there would be zero matches,
          // unless the option is already selected (so the user can always clear).
          const disabled = hasCount && !isSelected && count < 1;

          const workgroupLabel = workgroup.workgroup + (workgroup.disabled !== null ? " ( " + t("disabled") + ")" : "");
          const label = hasCount ? `${workgroupLabel} (${count})` : workgroupLabel;
          return (
            <Button
              key={workgroup.id}
              size="small"
              variant={isSelected ? "contained" : "outlined"}
              onClick={() => toggle(workgroup.id)}
              disabled={disabled}
              sx={{ textTransform: "none" }}
              data-cy={`workgroup-button-${workgroup.id}`}>
              {label}
            </Button>
          );
        })}
      </Stack>
    </Box>
  );
};
