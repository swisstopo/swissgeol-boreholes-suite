import { FC } from "react";
import { useTranslation } from "react-i18next";
import { Stack, Typography } from "@mui/material";
import { Check } from "lucide-react";
import { theme } from "../../../../../AppTheme.ts";
import { BoreholesCard } from "../../../../../components/boreholesCard.tsx";
import { LogImportItemType, LogImportOutcome, LogImportResultItem, LogImportUploadState } from "../logInterfaces.ts";
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

const itemTypeKey: Record<LogImportItemType, string> = {
  Run: "logRun",
  File: "logFile",
};

const uploadStateKey: Record<LogImportUploadState, string> = {
  pending: "importUploadPending",
  uploading: "importUploadRunning",
  uploaded: "importUploadDone",
  failed: "importUploadFailed",
};

/**
 * Shows what the import did with every row.
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
                  <Typography
                    variant="body2"
                    sx={{
                      width: theme.spacing(12),
                      flexShrink: 0,
                      whiteSpace: "nowrap",
                      color: theme.palette.buttonStates.outlined.disabled.color,
                    }}>
                    {t(itemTypeKey[item.type])}
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 500, minWidth: 0, flexGrow: 1, flexBasis: 0 }}>
                    {item.identifier}
                  </Typography>
                  <Typography variant="body2" sx={{ flexGrow: 2, minWidth: 0, flexBasis: 0 }}>
                    {t(item.messageKey, item.values ?? {})}
                  </Typography>
                  <Stack
                    direction="row"
                    justifyContent="flex-end"
                    alignItems="center"
                    data-cy={`import-upload-state-${item.logFileId ?? "none"}`}
                    sx={{ width: theme.spacing(21), flexShrink: 0, alignSelf: "center" }}>
                    {uploadState === "uploaded" ? (
                      <Check
                        size={18}
                        color={theme.palette.success.main}
                        aria-label={t(uploadStateKey[uploadState])}
                        data-cy="import-upload-done"
                      />
                    ) : (
                      <Typography
                        variant="body2"
                        sx={{
                          whiteSpace: "nowrap",
                          textAlign: "right",
                          color: uploadState === "failed" ? theme.palette.error.main : undefined,
                        }}>
                        {uploadState ? t(uploadStateKey[uploadState]) : ""}
                      </Typography>
                    )}
                  </Stack>
                </Stack>
              );
            })}
          </Stack>
        </BoreholesCard>
      ))}
    </Stack>
  );
};
