import { FC } from "react";
import { useTranslation } from "react-i18next";
import { Box, Button, Stack } from "@mui/material";
import { WorkflowStatus } from "@swissgeol/ui-core";
import { capitalizeFirstLetter } from "../../../../utils";
import { filterParsers } from "../../useBoreholeUrlParams.ts";

interface StatusFilterProps {
  selectedWorkflowStatus?: string[];
  setFilterField: (
    key: keyof typeof filterParsers,
    value: string | string[] | number[] | boolean | null | undefined,
  ) => void;
  counts?: Record<string, number>;
}

export const StatusFilter: FC<StatusFilterProps> = ({ selectedWorkflowStatus, setFilterField, counts }) => {
  const { t } = useTranslation();

  const workflowStatus = [
    WorkflowStatus.Draft,
    WorkflowStatus.InReview,
    WorkflowStatus.Reviewed,
    WorkflowStatus.Published,
  ];

  const selected = selectedWorkflowStatus ?? [];
  const toggle = (key: string) => {
    const next = selected.includes(key) ? selected.filter(k => k !== key) : [...selected, key];
    setFilterField("workflowStatus", next.length === 0 ? null : next);
  };

  return (
    <Box data-cy="workflow-status-formSelect">
      <Stack direction="row" flexWrap="wrap" gap={0.5}>
        {workflowStatus.map(status => {
          const isSelected = selected.includes(status);
          const count = counts?.[status] ?? 0;
          const hasCount = counts !== undefined;
          // Disable when count information is available and there would be zero matches,
          // unless the option is already selected (so the user can always clear).
          const disabled = hasCount && !isSelected && count < 1;
          const statusLabel = capitalizeFirstLetter(t(`statuses.${status}`));
          const label = hasCount ? `${statusLabel} (${count})` : statusLabel;
          return (
            <Button
              key={status}
              size="small"
              variant={isSelected ? "contained" : "outlined"}
              onClick={() => toggle(status)}
              disabled={disabled}
              sx={{ textTransform: "none" }}
              data-cy={`workflow-status-button-${status}`}>
              {label}
            </Button>
          );
        })}
      </Stack>
    </Box>
  );
};
