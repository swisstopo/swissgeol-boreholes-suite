import React, { useEffect, useState } from "react";
import { Accept, FileRejection, useDropzone } from "react-dropzone";
import { useTranslation } from "react-i18next";
import { Box, Stack, Typography } from "@mui/material";
import { File as FileIcon, Trash2 } from "lucide-react";
import UploadIcon from "../assets/icons/upload.svg?react";
import { theme } from "../AppTheme.ts";

interface FileDropzoneProps {
  file: File | null;
  setFile: React.Dispatch<React.SetStateAction<File | null>>;
  onHandleFileChange: (file: File | null) => void;
  defaultText: string;
  maxFilesToSelectAtOnce: number;
  maxFilesToUpload: number;
  acceptedFileTypes: string[];
}

export const BoreholeImportDropzone = ({
  file,
  setFile,
  onHandleFileChange,
  maxFilesToSelectAtOnce,
  acceptedFileTypes,
}: FileDropzoneProps) => {
  const { t } = useTranslation();
  const defaultDropzoneTextColor = theme.palette.primary.main;
  const [dropzoneErrorText, setDropzoneErrorText] = useState("");

  // Set the color of the dropzone text to red and display an error message
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

  // Is called when the files array changes. This is used to update the file list in the parent component.
  useEffect(() => {
    onHandleFileChange(file);
  }, [file, onHandleFileChange]);

  const onDropAccepted = (acceptedFiles: File[]) => {
    setDropzoneErrorText("");
    setFile(acceptedFiles[0]);
  };

  const removeFile = () => {
    setFile(null);
  };

  // Is called when the selected/dropped files are rejected
  const onDropRejected = (fileRejections: FileRejection[]) => {
    const errorCode = fileRejections[0].errors[0].code;
    showErrorMsg(errorCode);
  };

  // Create the dropzone
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
    flex: 1,
    display: "flex",
    padding: "15px",
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "column",
    minHeight: "15vh",
    maxWidth: "95vw",
    fontSize: "20px",
    borderWidth: "2px",
    borderRadius: "5px",
    borderColor: defaultDropzoneTextColor,
    borderStyle: "dashed",
    backgroundColor: theme.palette.background.lightgrey,
    color: defaultDropzoneTextColor,
    outline: "none",
    transition: "border 0.24s ease-in-out",
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
            {dropzoneErrorText && DropZoneErrorTypography(dropzoneErrorText)}

            {!dropzoneErrorText && (
              <Stack alignItems={"center"}>
                {DropZoneInfoTypography(t("clickOrDragAndDrop"))}
                {DropZoneInfoTypography(t("allowedFormats") + ": JSON, CSV")}
                {DropZoneInfoTypography(t("fileLimit1File200Mb"))}
                {DropZoneInfoTypography(t("needHelpSeeDocumentation"))}
              </Stack>
            )}
          </Box>

          <input {...getInputProps()} aria-label="import-boreholeFile-input" />
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
