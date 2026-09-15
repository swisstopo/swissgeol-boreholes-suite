import { FC } from "react";
import { useTranslation } from "react-i18next";
import { Stack, Typography } from "@mui/material";
import { theme } from "../../../../../AppTheme.ts";
import { BoreholesCard } from "../../../../../components/boreholesCard.tsx";
import { LogImportOutcome, LogImportResultItem, LogImportUploadState } from "../logInterfaces.ts";
import { groupByOutcome } from "./importReport.ts";

interface ImportReportStepProps {
  items: LogImportResultItem[];
  uploadStates: Record<number, LogImportUploadState>;
}

const outcomeTitleKey: Record<LogImportOutcome, string> = {
  Added: "importOutcomeAdded",
  AlreadyExists: "importOutcomeAlreadyExists",
  SkippedIncomplete: "importOutcomeSkippedIncomplete",
  Error: "importOutcomeError",
};

const uploadStateKey: Record<LogImportUploadState, string> = {
  pending: "importUploadPending",
  uploading: "importUploadRunning",
  uploaded: "importUploadDone",
  failed: "importUploadFailed",
};

/**
 * Shows what the import did with every row.
 *
 * The status of an added attachment is rendered from the first paint onwards, in a slot of its
 * own, so a finishing upload changes the text in place instead of adding anything to the layout.
 * That slot is fixed in width and never wraps, so a row keeps its height when its status text
 * changes.
 */
export const ImportReportStep: FC<ImportReportStepProps> = ({ items, uploadStates }) => {
  const { t } = useTranslation();
  const groups = groupByOutcome(items);

  return (
    <Stack gap={1.5} data-cy="import-step-report">
      {groups.map(group => (
        <BoreholesCard key={group.outcome} title={t(outcomeTitleKey[group.outcome])}>
          <Stack gap={0.5}>
            {group.items.map(item => {
              const uploadState = item.logFileId === undefined ? undefined : uploadStates[item.logFileId];
              const rowNumber = item.values?.rowNumber;
              return (
                <Stack
                  key={`${item.type}-${item.identifier}-${rowNumber ?? ""}`}
                  direction="row"
                  gap={1}
                  alignItems="baseline">
                  <Typography variant="body2" sx={{ fontWeight: 500, minWidth: 0, flexGrow: 1 }}>
                    {item.identifier}
                  </Typography>
                  <Typography variant="body2" sx={{ flexGrow: 2, minWidth: 0 }}>
                    {t(item.messageKey, item.values ?? {})}
                  </Typography>
                  <Typography
                    variant="body2"
                    data-cy={`import-upload-state-${item.logFileId ?? "none"}`}
                    sx={{
                      width: theme.spacing(18),
                      flexShrink: 0,
                      whiteSpace: "nowrap",
                      textAlign: "right",
                      color: uploadState === "failed" ? theme.palette.error.main : undefined,
                    }}>
                    {uploadState ? t(uploadStateKey[uploadState]) : ""}
                  </Typography>
                </Stack>
              );
            })}
          </Stack>
        </BoreholesCard>
      ))}
    </Stack>
  );
};
