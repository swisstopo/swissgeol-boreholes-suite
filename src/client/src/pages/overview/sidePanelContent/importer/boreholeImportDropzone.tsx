import React, { MouseEvent, useState } from "react";
import { Accept, ErrorCode, FileError, FileRejection, useDropzone } from "react-dropzone";
import { useTranslation } from "react-i18next";
import { Box, Stack, Typography } from "@mui/material";
import { CircleX, File as FileIcon, Trash2 } from "lucide-react";
import UploadIcon from "../../../../assets/icons/upload.svg?react";
import { formatFileSize } from "../../../../api/fileSize.ts";
import { theme } from "../../../../AppTheme.ts";
import { importFormatOf } from "./importFormat.ts";

interface BoreholeImportDropzoneProps {
  file: File | null;
  setFile: React.Dispatch<React.SetStateAction<File | null>>;
  acceptedFileTypes: string[];

  /** The largest a CSV or a JSON may be, in bytes: each of them travels to the server as one request. */
  maxDataFileSize: number;

  /** The largest an archive may be, in bytes: it is unpacked here and sent one attachment at a time. */
  maxArchiveSize: number;
}

const DropZoneTypography = ({ text, color }: { text: string; color?: string }) => (
  <Typography variant="h6" sx={{ textAlign: "center" }} color={color ?? theme.palette.action.disabled}>
    {text}
  </Typography>
);

export const BoreholeImportDropzone = ({
  file,
  setFile,
  acceptedFileTypes,
  maxDataFileSize,
  maxArchiveSize,
}: BoreholeImportDropzoneProps) => {
  const { t } = useTranslation();
  const [dropzoneErrorText, setDropzoneErrorText] = useState("");

  const maxSizeOf = (candidate: File): number =>
    importFormatOf(candidate) === "archive" ? maxArchiveSize : maxDataFileSize;

  // The dropzone takes all three formats at once and they are not held to the same limit, so the
  // size is checked per file rather than by the one `maxSize` the dropzone would apply to each.
  const refuseOversized = (candidate: File): FileError | null =>
    candidate.size <= maxSizeOf(candidate)
      ? null
      : { code: ErrorCode.FileTooLarge, message: "The file is larger than its format is allowed to be." };

  const showErrorMsg = (rejection: FileRejection) => {
    switch (rejection.errors[0].code) {
      case ErrorCode.FileInvalidType:
        setDropzoneErrorText(t("dropZoneInvalidFileType"));
        break;
      case ErrorCode.TooManyFiles:
        setDropzoneErrorText(t("dropZoneMaximumFilesToSelectAtOnce") + " (max: 1)");
        break;
      case ErrorCode.FileTooLarge:
        setDropzoneErrorText(t("fileMaxSizeExceeded", { size: formatFileSize(maxSizeOf(rejection.file)) }));
        break;
      default:
        setDropzoneErrorText(t("dropZoneDefaultErrorMsg"));
    }
  };

  const onDropAccepted = (acceptedFiles: File[]) => {
    setDropzoneErrorText("");
    setFile(acceptedFiles[0]);
  };

  const removeFile = () => {
    setFile(null);
  };

  const resetDropzone = (e: MouseEvent) => {
    e.stopPropagation();
    setFile(null);
    setDropzoneErrorText("");
  };

  const onDropRejected = (fileRejections: FileRejection[]) => {
    showErrorMsg(fileRejections[0]);
  };

  const { getRootProps, getInputProps } = useDropzone({
    onDropRejected,
    onDropAccepted,
    maxFiles: 1,
    validator: refuseOversized,
    accept: acceptedFileTypes.reduce((acc, type) => {
      acc[type] = [];
      return acc;
    }, {} as Accept),
  });

  const dropZoneStyles = {
    padding: "15px",
    borderWidth: "2px",
    borderRadius: "5px",
    minHeight: "200px",
    borderColor: theme.palette.primary.main,
    borderStyle: "dashed",
    color: theme.palette.primary.main,
  };

  return (
    <>
      {!file && (
        <Box
          data-cy="import-boreholeFile-input"
          sx={dropZoneStyles}
          {...getRootProps()}
          onDragOver={e => {
            e.stopPropagation();
            e.preventDefault();
            e.dataTransfer.dropEffect = "copy";
          }}>
          <Box>
            <Stack gap={1} direction={"row"} p={1} justifyContent={"center"}>
              <UploadIcon />
              <Typography variant="h6">{t("dataImport")}</Typography>
            </Stack>
            {dropzoneErrorText && (
              <Stack alignItems={"center"} gap={1}>
                <DropZoneTypography text={dropzoneErrorText} color={theme.palette.error.main} />
                <CircleX color={theme.palette.error.main} onClick={resetDropzone} />
              </Stack>
            )}
            {!dropzoneErrorText && (
              <Stack alignItems={"center"}>
                <DropZoneTypography text={t("clickOrDragAndDrop")} />
                <DropZoneTypography text={t("allowedFormats") + ": CSV, JSON, ZIP"} />
                <DropZoneTypography
                  text={t("importFileSizeLimits", {
                    dataFileSize: formatFileSize(maxDataFileSize),
                    archiveSize: formatFileSize(maxArchiveSize),
                  })}
                />
                <DropZoneTypography text={t("needHelpSeeDocumentation")} />
              </Stack>
            )}
          </Box>
          <input {...getInputProps()} />
        </Box>
      )}
      {file && (
        <>
          <Typography variant="h5">{t("uploadedFile")} </Typography>
          <Stack direction={"row"} gap={1} p={2} sx={{ backgroundColor: theme.palette.background.default }}>
            <FileIcon />
            <Typography sx={{ wordWrap: "break-word", maxWidth: 230 }}>{file.name}</Typography>
            <Trash2 color={theme.palette.primary.main} onClick={() => removeFile()} />
          </Stack>
        </>
      )}
    </>
  );
};
