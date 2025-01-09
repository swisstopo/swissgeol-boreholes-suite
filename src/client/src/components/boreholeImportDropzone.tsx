import React, { MouseEvent, useState } from "react";
import { Accept, FileRejection, useDropzone } from "react-dropzone";
import { useTranslation } from "react-i18next";
import { Box, Stack, Typography } from "@mui/material";
import { CircleX, File as FileIcon, Trash2 } from "lucide-react";
import UploadIcon from "../assets/icons/upload.svg?react";
import { theme } from "../AppTheme.ts";

interface FileDropzoneProps {
  file: File | null;
  setFile: React.Dispatch<React.SetStateAction<File | null>>;
  defaultText: string;
  maxFilesToSelectAtOnce: number;
  maxFilesToUpload: number;
  acceptedFileTypes: string[];
}

export const BoreholeImportDropzone = ({
  file,
  setFile,
  maxFilesToSelectAtOnce,
  acceptedFileTypes,
}: FileDropzoneProps) => {
  const { t } = useTranslation();
  const defaultDropzoneTextColor = theme.palette.primary.main;
  const [dropzoneErrorText, setDropzoneErrorText] = useState("");

  const showErrorMsg = (errorCode: string) => {
    switch (errorCode) {
      case "file-invalid-type":
        setDropzoneErrorText(t("dropZoneInvalidFileType"));
        break;
      case "too-many-files":
        setDropzoneErrorText(t("dropZoneMaximumFilesToSelectAtOnce") + " (max: 1)");
        break;
      case "file-too-large":
        setDropzoneErrorText(t("dropZoneFileToLarge"));
        break;
      case "max-upload-reached":
        setDropzoneErrorText(t("dropZoneMaxFilesToUploadReached") + " (max additional: 1)");
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
    const errorCode = fileRejections[0].errors[0].code;
    showErrorMsg(errorCode);
  };

  const { getRootProps, getInputProps } = useDropzone({
    onDropRejected,
    onDropAccepted,
    maxFiles: maxFilesToSelectAtOnce || Infinity,
    maxSize: 209715200,
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
    borderColor: defaultDropzoneTextColor,
    borderStyle: "dashed",
    color: defaultDropzoneTextColor,
  };

  const DropZoneInfoTypography = (text: string) => (
    <Typography variant="h6" sx={{ textAlign: "center" }} color={theme.palette.action.disabled}>
      {text}
    </Typography>
  );

  const DropZoneErrorTypography = (text: string) => (
    <Typography variant="h6" sx={{ textAlign: "center" }} color={theme.palette.error.main}>
      {text}
    </Typography>
  );

  return (
    <>
      {!file && (
        <Box
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
                {DropZoneErrorTypography(dropzoneErrorText)}
                <CircleX color={theme.palette.error.main} onClick={resetDropzone} />
              </Stack>
            )}
            {!dropzoneErrorText && (
              <Stack alignItems={"center"}>
                {DropZoneInfoTypography(t("clickOrDragAndDrop"))}
                {DropZoneInfoTypography(t("allowedFormats") + ": JSON, CSV")}
                {DropZoneInfoTypography(t("fileLimit1File200Mb"))}
                {DropZoneInfoTypography(t("needHelpSeeDocumentation"))}
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
            <Typography variant={"body1"}> {file.name}</Typography>
            <Trash2 color={theme.palette.primary.main} onClick={() => removeFile()} />
          </Stack>
        </>
      )}
    </>
  );
};
