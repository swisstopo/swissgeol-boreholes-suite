import { CSSProperties, FC, useCallback, useEffect, useMemo, useState } from "react";
import { FileRejection, useDropzone } from "react-dropzone";
import { useTranslation } from "react-i18next";
import { Box, Stack, Typography } from "@mui/material";
import { CloudUpload, X } from "lucide-react";
import { maxFileSizeBytes } from "../../../../api/file/fileInterfaces.ts";
import { theme } from "../../../../AppTheme.ts";
import { StandaloneIconButton } from "../../../../components/buttons/buttons.tsx";

interface FileDropzoneProps {
  existingFile?: File;
  onChange: (file?: File) => void;
  errorMessageKey?: string;
}

export const FileDropzone: FC<FileDropzoneProps> = ({ existingFile, onChange, errorMessageKey }) => {
  const { t } = useTranslation();
  const [file, setFile] = useState<File | undefined>(existingFile);
  const [error, setError] = useState<string | undefined>(errorMessageKey);

  useEffect(() => {
    setError(errorMessageKey);
  }, [errorMessageKey]);

  useEffect(() => {
    onChange(file);
  }, [file, onChange]);

  const onDrop = useCallback(
    (acceptedFiles: File[], fileRejections: FileRejection[]) => {
      if (error) {
        setError(undefined);
      }
      if (fileRejections.length > 0) {
        let errorKey: string;
        const errorCode = fileRejections[0].errors[0].code;

        if (errorCode === "file-too-large") {
          errorKey = "fileMaxSizeExceeded";
        } else {
          errorKey = "fileDropzoneErrorChooseFile";
        }

        setError(errorKey);
      } else {
        setFile(acceptedFiles[0]);
      }
    },
    [error, setFile],
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    maxFiles: 1,
    maxSize: maxFileSizeBytes,
  });

  const style = useMemo<CSSProperties>(
    () => ({
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      gap: theme.spacing(0.75),
      minHeight: "84px",
      padding: "20px",
      border: `2px dashed`,
      borderRadius: "4px",
      outline: "none",
      transition: "border .24s ease-in-out",
      cursor: "pointer",
      borderColor: isDragActive
        ? theme.palette.secondary.main
        : error
          ? theme.palette.error.main
          : theme.palette.primary.main,
    }),
    [error, isDragActive],
  );

  if (file) {
    return (
      <Stack
        data-cy={"file-dropzone"}
        sx={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          padding: theme.spacing(0.75),
          paddingLeft: theme.spacing(2.5),
          backgroundColor: theme.palette.background.fileDropzoneSelected,
          border: `1px solid ${theme.palette.border.fileDropzoneSelected}`,
          borderRadius: theme.spacing(0.5),
        }}>
        <Typography variant={"body2"}>{file?.name ?? "new"}</Typography>
        <StandaloneIconButton
          icon={<X />}
          onClick={() => setFile(undefined)}
          color={"primaryInverse"}
          sx={{ border: "none", "&:hover": { border: "none" } }}
        />
      </Stack>
    );
  }

  return (
    <Box
      {...getRootProps({
        style,
        onDragOver: e => {
          e.stopPropagation();
          e.preventDefault();
          e.dataTransfer.dropEffect = "copy";
        },
      })}>
      <input {...getInputProps()} data-cy="file-dropzone" />
      <Stack direction={"row"} gap={1.5} sx={{ color: theme.palette.primary.main }}>
        <CloudUpload />
        <Typography variant="body2">{t("fileDropzoneText1")}</Typography>
      </Stack>
      <Typography variant="body2" color={theme.palette.buttonStates.outlined.disabled.color}>
        {t("fileDropzoneText2")}
      </Typography>
      {error && (
        <Typography variant="body2" color={theme.palette.error.main}>
          {t(error)}
        </Typography>
      )}
    </Box>
  );
};
