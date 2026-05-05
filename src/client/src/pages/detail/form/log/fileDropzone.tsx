import { CSSProperties, FC, useCallback, useEffect, useMemo, useState } from "react";
import { Accept, FileRejection, useDropzone } from "react-dropzone";
import { useTranslation } from "react-i18next";
import { Box, Stack, Typography } from "@mui/material";
import { CloudUpload, X } from "lucide-react";
import { FileSizeLimit, largeMaxFileSizeBytes } from "../../../../api/file.ts";
import { theme } from "../../../../AppTheme.ts";
import { StandaloneIconButton } from "../../../../components/buttons/buttons.tsx";

interface FileDropzoneProps {
  existingFile?: File;
  onChange: (files: File[]) => void;
  errorMessageKey?: string;
  accept?: Accept;
  maxFileSize?: number;
  multiple?: boolean;
}

export const FileDropzone: FC<FileDropzoneProps> = ({
  existingFile,
  onChange,
  errorMessageKey,
  accept,
  maxFileSize = largeMaxFileSizeBytes,
  multiple = false,
}) => {
  const { t } = useTranslation();
  const [files, setFiles] = useState<File[]>(existingFile ? [existingFile] : []);
  const [error, setError] = useState<string | undefined>();

  useEffect(() => {
    if (!errorMessageKey) return;
    setError(t(errorMessageKey));
  }, [errorMessageKey, t]);

  const fileSizeLabel = useMemo(() => {
    if (maxFileSize === largeMaxFileSizeBytes) return FileSizeLimit.Large;
    const mb = maxFileSize / 1_000_000;
    return mb >= 1 ? `${mb} MB` : `${maxFileSize / 1_000} KB`;
  }, [maxFileSize]);

  const removeFileAt = useCallback(
    (index: number) => {
      setFiles(prev => {
        const next = prev.filter((_, i) => i !== index);
        onChange(next);
        return next;
      });
    },
    [onChange],
  );

  const onDrop = useCallback(
    (acceptedFiles: File[], fileRejections: FileRejection[]) => {
      if (error) {
        setError(undefined);
      }
      if (fileRejections.length > 0) {
        let errorMessage: string;
        const errorCode = fileRejections[0].errors[0].code;

        if (errorCode === "file-too-large") {
          errorMessage = t("fileMaxSizeExceeded", { size: fileSizeLabel });
        } else if (errorCode === "file-invalid-type") {
          errorMessage = t("fileInvalidType");
        } else if (errorCode === "too-many-files") {
          errorMessage = t("fileDropzoneErrorChooseFile");
        } else {
          errorMessage = t("fileDropzoneErrorChooseFile");
        }

        setError(errorMessage);
      } else {
        setFiles(prev => {
          const next = multiple ? [...prev, ...acceptedFiles] : acceptedFiles;
          onChange(next);
          return next;
        });
      }
    },
    [error, fileSizeLabel, multiple, onChange, t],
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    maxFiles: multiple ? undefined : 1,
    maxSize: maxFileSize,
    accept,
    multiple,
  });

  const style = useMemo<CSSProperties>(() => {
    const getBorderColor = () => {
      if (isDragActive) return theme.palette.secondary.main;
      if (error) return theme.palette.error.main;
      return theme.palette.primary.main;
    };

    return {
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
      borderColor: getBorderColor(),
    };
  }, [error, isDragActive]);

  const fileItemStyle = {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: theme.spacing(0.75),
    paddingLeft: theme.spacing(2.5),
    backgroundColor: theme.palette.background.fileDropzoneSelected,
    border: `1px solid ${theme.palette.border.fileDropzoneSelected}`,
    borderRadius: theme.spacing(0.5),
  } as const;

  return (
    <Stack gap={1}>
      {(files.length === 0 || multiple) && (
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
              {error}
            </Typography>
          )}
        </Box>
      )}
      {files.map((f, index) => (
        <Stack key={`${f.name}-${f.lastModified}-${f.size}`} data-cy={"file-dropzone"} sx={fileItemStyle}>
          <Typography variant={"body2"}>{f.name}</Typography>
          <StandaloneIconButton
            icon={<X />}
            onClick={() => removeFileAt(index)}
            color={"primaryInverse"}
            sx={{ border: "none", "&:hover": { border: "none" } }}
          />
        </Stack>
      ))}
    </Stack>
  );
};
