import { CSSProperties, FC, useCallback, useEffect, useState } from "react";
import { FileRejection, useDropzone } from "react-dropzone";
import { useTranslation } from "react-i18next";
import { Box, Chip } from "@mui/material";
import { theme } from "../../../../AppTheme.ts";

interface FileDropzoneProps {
  onHandleFileChange: (files: File[]) => void; // Receives the files array whenever it changes.
  defaultText: string; // The default text to display in the dropzone.
  maxFilesToSelectAtOnce: number;
  maxFilesToUpload: number;
  acceptedFileTypes: string[];
  isDisabled: boolean;
  dataCy?: string;
  setFileType?: (fileType: string) => void;
}

// A component that provides a file dropzone for selecting and uploading files.
export const FileDropzone: FC<FileDropzoneProps> = props => {
  const {
    onHandleFileChange,
    defaultText,
    maxFilesToSelectAtOnce,
    maxFilesToUpload,
    acceptedFileTypes,
    isDisabled,
    dataCy,
    setFileType,
  } = props;
  const { t } = useTranslation();
  const [files, setFiles] = useState<File[]>([]);
  const [dropZoneText, setDropZoneText] = useState(t(defaultText));
  const defaultDropzoneTextColor = isDisabled ? theme.palette.action.disabled : theme.palette.primary.main;
  const [dropZoneTextColor, setDropZoneTextColor] = useState(defaultDropzoneTextColor);
  const [syncedDefaultDropzoneTextColor, setSyncedDefaultDropzoneTextColor] = useState(defaultDropzoneTextColor);

  if (defaultDropzoneTextColor !== syncedDefaultDropzoneTextColor) {
    setSyncedDefaultDropzoneTextColor(defaultDropzoneTextColor);
    setDropZoneTextColor(defaultDropzoneTextColor);
  }

  // Set the color of the dropzone text to red and display an error message
  const showErrorMsg = useCallback(
    (errorCode: string) => {
      setDropZoneTextColor("red");
      switch (errorCode) {
        case "file-invalid-type":
          setDropZoneText(t("dropZoneInvalidFileType"));
          break;
        case "too-many-files":
          setDropZoneText(
            t("dropZoneMaximumFilesToSelectAtOnce") +
              " (max: " +
              Math.min(maxFilesToSelectAtOnce, maxFilesToUpload - files.length) +
              ")",
          );
          break;
        case "file-too-large":
          setDropZoneText(t("dropZoneFileToLarge"));
          break;
        case "max-upload-reached":
          setDropZoneText(
            t("dropZoneMaxFilesToUploadReached") + " (max additional: " + (maxFilesToUpload - files.length) + ")",
          );
          break;
        default:
          setDropZoneText(t("dropZoneDefaultErrorMsg"));
      }
    },
    [files.length, maxFilesToSelectAtOnce, maxFilesToUpload, t],
  );

  // Is called when the files array changes. This is used to update the file list in the parent component.
  useEffect(() => {
    onHandleFileChange(files);
  }, [files, onHandleFileChange]);

  // Is called when the selected/dropped files are accepted
  const onDropAccepted = useCallback(
    (acceptedFiles: File[]) => {
      // Check if the max number of files to upload would be exceeded with the new selected files.
      // If not, add the new files to the files array.
      if (files.length + acceptedFiles.length > maxFilesToUpload) {
        const errorCode = "max-upload-reached";
        showErrorMsg(errorCode);
      } else {
        setDropZoneTextColor(defaultDropzoneTextColor);
        setDropZoneText(t(defaultText));
        setFiles(prevFiles => [...prevFiles, ...acceptedFiles]);

        if (setFileType) {
          if (acceptedFileTypes.includes("text/csv")) {
            setFileType("csv");
          }
          if (acceptedFileTypes.includes("application/json")) {
            setFileType("json");
          }
        }
      }
    },
    [
      defaultDropzoneTextColor,
      defaultText,
      files.length,
      maxFilesToUpload,
      showErrorMsg,
      t,
      acceptedFileTypes,
      setFileType,
    ],
  );

  // Is called when an accepted file is removed.
  const removeFile = (fileToRemove: File) => {
    setFiles(prevFiles => prevFiles.filter(file => file !== fileToRemove));
    if (setFileType) {
      setFileType("");
    }
  };

  // Is called when the selected/dropped files are rejected
  const onDropRejected = useCallback(
    (fileRejections: FileRejection[]) => {
      const errorCode = fileRejections[0].errors[0].code;
      showErrorMsg(errorCode);
    },
    [showErrorMsg],
  );

  // Create the dropzone
  const { getRootProps, getInputProps } = useDropzone({
    onDropRejected,
    onDropAccepted,
    maxFiles: maxFilesToSelectAtOnce || Infinity,
    maxSize: 209715200,
    accept:
      acceptedFileTypes.length > 0
        ? acceptedFileTypes.reduce<Record<string, string[]>>((acc, type) => {
            acc[type] = [];
            return acc;
          }, {})
        : undefined,
    noClick: isDisabled,
    noKeyboard: isDisabled,
  });

  const dropZoneStyles: CSSProperties = {
    flex: 1,
    display: "flex",
    padding: "15px",
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "column",
    minHeight: "10vh",
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

  return (
    <div data-cy={dataCy} style={{ paddingLeft: "2em", width: "50%" }}>
      <Box
        minHeight={"7vh"}
        style={dropZoneStyles}
        {...getRootProps()}
        onDragOver={e => {
          e.stopPropagation();
          e.preventDefault();
          e.dataTransfer.dropEffect = isDisabled ? "none" : "copy";
        }}>
        <p
          style={{
            marginBottom: "0",
            color: dropZoneTextColor,
          }}>
          {dropZoneText}
        </p>
        <input {...getInputProps()} aria-label="import-boreholeFile-input" />
        {files.length > 0 && (
          <div
            style={{
              minHeight: "auto",
            }}>
            <div
              style={{
                display: "inline-flex",
                flexWrap: "wrap",
                width: "100%",
              }}>
              {files.map(file => (
                <div
                  key={file.name}
                  style={{
                    display: "flex",
                    fontSize: "12px",
                  }}>
                  <Chip
                    sx={{ backgroundColor: theme.palette.background.default, mr: 0.5, mb: 0.5 }}
                    label={file.name}
                    variant="outlined"
                    onDelete={() => removeFile(file)}
                  />
                </div>
              ))}
            </div>
          </div>
        )}
      </Box>
    </div>
  );
};
