import { FC, ReactNode } from "react";
import { Trans, useTranslation } from "react-i18next";
import { Box, Stack, Typography } from "@mui/material";
import { theme } from "../../../../AppTheme.ts";
import { capitalizeFirstLetter } from "../../../../utils.ts";
import { WorkflowChange } from "./workflow.ts";

export const HistoryEntry: FC<{ workflowChange: WorkflowChange }> = ({ workflowChange }) => {
  const { t } = useTranslation();

  const DescriptionText = ({ children }: { children: ReactNode }) => (
    <Typography variant="h6" color={theme.palette.tertiary.main} fontWeight={400}>
      {children}
    </Typography>
  );

  return (
    <Stack data-cy={`workflow-history-entry-${workflowChange.id}`}>
      <Stack direction="row" spacing={0.5} alignItems={"baseline"}>
        <Box
          sx={{
            height: 8,
            width: 8,
            borderRadius: 5,
            backgroundColor: theme.palette.primary.main,
            mr: "14px !important",
          }}
        />
        <Typography variant="h5">{`${[capitalizeFirstLetter(workflowChange.createdBy?.firstName), capitalizeFirstLetter(workflowChange.createdBy?.lastName)].filter(Boolean).join(" ")}`}</Typography>
        <DescriptionText>
          {`∙ ${new Date(workflowChange?.created).toLocaleDateString("de-CH", {
            day: "2-digit",
            month: "short",
            year: "numeric",
          })}`}
        </DescriptionText>
      </Stack>
      <Box
        sx={{
          pl: 3,
          ml: "3px!important",
          background: `linear-gradient(#ACB4BD 50%, rgba(255,255,255,0) 0%)`,
          backgroundPosition: "left",
          backgroundSize: "2px 13px",
          backgroundRepeat: "repeat-y",
        }}>
        {workflowChange.fromStatus && workflowChange.toStatus && (
          <Stack direction="row" gap={1} alignItems={"baseline"}>
            <DescriptionText>
              <Trans
                i18nKey="statusChangeMessage"
                values={{
                  from: t(`statuses.${workflowChange.fromStatus}`),
                  to: t(`statuses.${workflowChange.toStatus}`),
                }}
                components={{
                  strong: <Typography component="span" variant="h6" fontWeight="bold" color="secondary" />,
                }}
              />
            </DescriptionText>
          </Stack>
        )}
        {!workflowChange.fromStatus && (
          <Stack direction="row" gap={1} alignItems={"baseline"}>
            <DescriptionText>
              <Trans
                i18nKey="createdDraft"
                components={{
                  strong: <Typography component="span" variant="h6" fontWeight="bold" color="secondary" />,
                }}
              />
            </DescriptionText>
          </Stack>
        )}
        {workflowChange.assignee && (
          <Stack direction="row" gap={1} alignItems={"baseline"}>
            <Typography variant="h6" color={theme.palette.tertiary.main} fontWeight={400}>
              <Trans
                i18nKey="boreholeAssignedTo"
                values={{
                  user: `${capitalizeFirstLetter(workflowChange.assignee.firstName)} ${capitalizeFirstLetter(workflowChange.assignee.lastName)}`,
                }}
                components={{
                  strong: <Typography component="span" variant="h6" fontWeight="bold" color="secondary" />,
                }}
              />
            </Typography>
          </Stack>
        )}
        {workflowChange.comment && (
          <Box sx={{ p: 1.5, backgroundColor: theme.palette.background.grey, borderRadius: 1, mt: 1 }}>
            <DescriptionText>{workflowChange.comment}</DescriptionText>
          </Box>
        )}
      </Box>
    </Stack>
  );
};
