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
  onChange: (files: File[]) => string | void | Promise<void>;
  errorMessageKey?: string;
  accept?: Accept;
  maxFileSize?: number;
  multiple?: boolean;
  expectedFileNames?: string[];
}

const rejectionErrorMessageKey: Record<string, string> = {
  "file-too-large": "fileMaxSizeExceeded",
  "file-invalid-type": "fileInvalidType",
  "too-many-files": "fileDropzoneErrorChooseFile",
};

const filterExpectedFiles = (
  filesToAdd: File[],
  expectedFileNames: string[],
  alreadyProvided: File[],
): { accepted: File[]; rejected: File[] } => {
  const expectedSet = new Set(expectedFileNames.map(n => n.toLowerCase()));
  const providedSet = new Set(alreadyProvided.map(f => f.name.toLowerCase()));
  const accepted = filesToAdd.filter(
    f => expectedSet.has(f.name.toLowerCase()) && !providedSet.has(f.name.toLowerCase()),
  );
  const rejected = filesToAdd.filter(
    f => !expectedSet.has(f.name.toLowerCase()) || providedSet.has(f.name.toLowerCase()),
  );
  return { accepted, rejected };
};

export const FileDropzone: FC<FileDropzoneProps> = ({
  existingFile,
  onChange,
  errorMessageKey,
  accept,
  maxFileSize = largeMaxFileSizeBytes,
  multiple = false,
  expectedFileNames,
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
    const gb = maxFileSize / 1_000_000_000;
    if (gb >= 1) return `${gb} GB`;
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
        const errorCode = fileRejections[0].errors[0].code;
        const messageKey = rejectionErrorMessageKey[errorCode] ?? "fileDropzoneErrorChooseFile";
        setError(messageKey === "fileMaxSizeExceeded" ? t(messageKey, { size: fileSizeLabel }) : t(messageKey));
        return;
      }

      let filesToAdd = acceptedFiles;
      if (expectedFileNames) {
        const { accepted, rejected } = filterExpectedFiles(filesToAdd, expectedFileNames, files);
        filesToAdd = accepted;
        if (rejected.length > 0) {
          setError(t("unexpectedFiles", { count: rejected.length, files: rejected.map(f => f.name).join(", ") }));
        }
      }
      if (filesToAdd.length > 0) {
        const next = multiple ? [...files, ...filesToAdd] : filesToAdd;
        const validationError = onChange(next);
        if (typeof validationError === "string") {
          setError(validationError);
        } else {
          setFiles(next);
        }
      }
    },
    [error, expectedFileNames, files, fileSizeLabel, multiple, onChange, t],
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

  const allExpectedFilesProvided = useMemo(() => {
    if (!expectedFileNames || expectedFileNames.length === 0) return false;
    const providedSet = new Set(files.map(f => f.name.toLowerCase()));
    return expectedFileNames.every(n => providedSet.has(n.toLowerCase()));
  }, [expectedFileNames, files]);

  const showDropzone = (files.length === 0 || multiple) && !allExpectedFilesProvided;

  return (
    <Stack gap={1}>
      {showDropzone && (
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
            <Typography variant="body2">{t("fileDropzoneText")}</Typography>
          </Stack>
          {expectedFileNames && expectedFileNames.length > 0 ? (
            <Typography variant="body2" color={theme.palette.buttonStates.outlined.disabled.color}>
              {t("expectedFiles", { files: expectedFileNames.join(", ") })}
            </Typography>
          ) : (
            accept && (
              <Typography variant="body2" color={theme.palette.buttonStates.outlined.disabled.color}>
                {t("expectedFileTypes", {
                  count: Object.values(accept).flat().length,
                  types: Object.values(accept).flat().join(", "),
                })}
              </Typography>
            )
          )}
          <Typography variant="body2" color={theme.palette.buttonStates.outlined.disabled.color}>
            {t("maxFileSize", { size: fileSizeLabel })}
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
