import { FC } from "react";
import { useTranslation } from "react-i18next";
import { Stack, Typography } from "@mui/material";
import { FormContainer } from "../../../../../components/form/form.ts";
import { FileDropzone } from "../fileDropzone.tsx";

interface ImportFilesStepProps {
  requiredFilesPerRun: Record<string, string[]>;
  attachmentsPerRun: Record<string, File[]>;
  onFileChange: (file?: File) => void;
  onAttachmentsChange: (runNumber: string, files: File[]) => void;
  file?: File;
  hasUnreadableCsv?: boolean;
}

export const ImportFilesStep: FC<ImportFilesStepProps> = ({
  requiredFilesPerRun,
  attachmentsPerRun,
  onFileChange,
  onAttachmentsChange,
  file,
  hasUnreadableCsv,
}) => {
  const { t } = useTranslation();
  const runNumbers = Object.keys(requiredFilesPerRun);

  return (
    <FormContainer data-cy="import-step-files">
      <Typography>{t("importLogFilesDescription")}</Typography>
      <Stack gap={0.5}>
        <Typography variant="h6">{t("csvFile")}</Typography>
        <FileDropzone
          existingFiles={file ? [file] : undefined}
          onChange={files => onFileChange(files[0])}
          accept={{ "text/csv": [".csv"] }}
        />
        {hasUnreadableCsv && (
          <Typography variant="body2" color="error" data-cy="logFiles-csv-encoding-error">
            {t("importLogFilesUnsupportedEncoding")}
          </Typography>
        )}
      </Stack>
      {runNumbers.map(runNumber => (
        <Stack key={runNumber} gap={0.5} data-cy={`log-attachments-${runNumber}`}>
          <Typography variant="h6">{t("attachmentsForRun", { runNumber })}</Typography>
          <FileDropzone
            existingFiles={attachmentsPerRun[runNumber]}
            onChange={files => onAttachmentsChange(runNumber, files)}
            multiple={true}
            expectedFileNames={requiredFilesPerRun[runNumber]}
          />
        </Stack>
      ))}
    </FormContainer>
  );
};
