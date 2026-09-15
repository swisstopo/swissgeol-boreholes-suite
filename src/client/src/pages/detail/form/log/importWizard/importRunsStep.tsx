import { FC } from "react";
import { useTranslation } from "react-i18next";
import { Typography } from "@mui/material";
import { FormContainer } from "../../../../../components/form/form.ts";
import { FileDropzone } from "../fileDropzone.tsx";

interface ImportRunsStepProps {
  onFileChange: (file?: File) => void;
  file?: File;
}

export const ImportRunsStep: FC<ImportRunsStepProps> = ({ onFileChange }) => {
  const { t } = useTranslation();

  return (
    <FormContainer data-cy="import-step-runs">
      <Typography>{t("importLogRunsDescription")}</Typography>
      <FileDropzone onChange={files => onFileChange(files[0])} accept={{ "text/csv": [".csv"] }} />
    </FormContainer>
  );
};
