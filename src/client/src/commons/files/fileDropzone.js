import React, { useCallback, useEffect, useState, useRef } from "react";
import { useDropzone } from "react-dropzone";
import { useTranslation } from "react-i18next";
import { Box, Chip } from "@mui/material";

export const FileDropzone = props => {
  const {
    onHandleFileChange,
    defaultText,
    maxFilesToSelectAtOnce,
    maxFilesToUpload,
    acceptedFileExtension,
    isDisabled,
    dataCy,
  } = props;
  const { t } = useTranslation();
  const [files, setFiles] = useState([]);
  const [dropZoneText, setDropZoneText] = useState(null);
  const [dropZoneTextColor, setDropZoneTextColor] = useState(null);
  const defaultDropzoneTextColor = isDisabled ? "#9f9f9f" : "#2185d0";
  const initialDropzoneText = isDisabled
    ? t("dropZoneChooseBoreholeFilesFirst")
    : t(defaultText);

  useEffect(() => {
    setDropZoneText(initialDropzoneText);
    setDropZoneTextColor(defaultDropzoneTextColor);
  }, [defaultDropzoneTextColor, initialDropzoneText]);

  // Set the color of the dropzone text to red and display an error message
  const showErrorMsg = useCallback(
    errorCode => {
      setDropZoneTextColor("red");
      switch (errorCode) {
        case "file-invalid-type":
          setDropZoneText(t("dropZoneInvalidFileType"));
          break;
        case "too-many-files":
          setDropZoneText(
            t("dropZoneMaximumFilesToSelectAtOnce") +
              " (max: " +
              Math.min(
                maxFilesToSelectAtOnce,
                maxFilesToUpload - files.length,
              ) +
              ")",
          );
          break;
        case "file-too-large":
          setDropZoneText(t("dropZoneFileToLarge"));
          break;
        case "max-upload-reached":
          setDropZoneText(
            t("dropZoneMaxFilesToUploadReached") +
              " (max additional: " +
              (maxFilesToUpload - files.length) +
              ")",
          );
          break;
        default:
          setDropZoneText(t("dropZoneDefaultErrorMsg"));
      }
    },
    [files.length, maxFilesToSelectAtOnce, maxFilesToUpload, t],
  );

  const dropzoneRef = useRef(null);

  useEffect(() => {
    const div = dropzoneRef.current;
    const handleDragOver = e => {
      e.stopPropagation();
      e.preventDefault();
      e.dataTransfer.dropEffect = "copy";
    };

    div.addEventListener("dragover", handleDragOver);

    return () => {
      div.removeEventListener("dragover", handleDragOver);
    };
  }, []);

  // Is called when the files array changes. This is used to update the file list in the parent component.
  useEffect(() => {
    onHandleFileChange(files);
  }, [files, onHandleFileChange]);

  // Is called when the selected/dropped files are accepted
  const onDropAccepted = useCallback(
    acceptedFiles => {
      // Check if the max number of files to upload would be exceeded with the new selected files.
      // If not, add the new files to the files array.
      if (files.length + acceptedFiles.length > maxFilesToUpload) {
        const errorCode = "max-upload-reached";
        showErrorMsg(errorCode);
      } else {
        setDropZoneTextColor(defaultDropzoneTextColor);
        setDropZoneText(t(defaultText));
        setFiles(prevFiles => [...prevFiles, ...acceptedFiles]);
      }
    },
    [
      defaultDropzoneTextColor,
      defaultText,
      files.length,
      maxFilesToUpload,
      showErrorMsg,
      t,
    ],
  );

  // Is called when a accepted file is removed.
  const removeFile = fileToRemove => {
    setFiles(prevFiles => prevFiles.filter(file => file !== fileToRemove));
  };

  // IS called when the selected/dropped files are rejected
  const onDropRejected = useCallback(
    fileRejections => {
      const errorCode = fileRejections[0].errors[0].code;
      showErrorMsg(errorCode);
    },
    [showErrorMsg],
  );

  // Sets the accepted file types for the dropzone
  const setFileAcceptedFileTypes = () => {
    switch (acceptedFileExtension) {
      case ".pdf":
        return { "application/pdf": [".pdf"] };
      case ".csv":
        return { "text/csv": [".csv"] };
      default:
        break;
    }
  };

  // Create the dropzone
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDropRejected,
    onDropAccepted,
    maxFiles: maxFilesToSelectAtOnce,
    maxSize: 209715200,
    accept: setFileAcceptedFileTypes(),
    disabled: isDisabled || files.length >= maxFilesToUpload,
    noClick: isDisabled,
    noKeyboard: isDisabled,
  });

  const dropZoneStyles = {
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
    backgroundColor: "#d1d6d991",
    color: defaultDropzoneTextColor,
    outline: "none",
    transition: "border 0.24s ease-in-out",
  };

  return (
    <div
      ref={dropzoneRef}
      data-cy={dataCy}
      style={{ paddingLeft: "2em", width: "50%" }}>
      <Box minHeight={"7vh"} style={dropZoneStyles} {...getRootProps()}>
        <p
          style={{
            marginBottom: "0",
            color: dropZoneTextColor,
          }}>
          {dropZoneText}
        </p>
        <input {...getInputProps()} aria-label="import-boreholeFile-input" />
        {files.length > 0 ? (
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
                  style={{
                    display: "flex",
                    fontSize: "12px",
                  }}>
                  <Chip
                    sx={{ backgroundColor: "#ffffff", mr: 0.5, mb: 0.5 }}
                    label={file.name}
                    variant="outlined"
                    onDelete={() => removeFile(file)}
                  />
                </div>
              ))}
            </div>
          </div>
        ) : null}
      </Box>
    </div>
  );
};
