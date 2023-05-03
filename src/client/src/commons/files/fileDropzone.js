import React, { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import styled from "styled-components";
import { useTranslation } from "react-i18next";
import { Chip } from "@mui/material";

const defaultDropzoneTextColor = "#9f9f9f";

const Container = styled.div`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: ${props => props.minHeight || "15vh"};
  max-width: 95vw;
  font-size: 20px;
  border-width: 2px;
  border-radius: 5px;
  border-color: "#d1d6d991";
  border-style: dashed;
  background-color: #d1d6d991;
  color: ${defaultDropzoneTextColor};
  outline: none;
  transition: border 0.24s ease-in-out;
`;

export const FileDropzone = props => {
  const { t } = useTranslation();
  const [files, setFiles] = useState([]);
  const [dropZoneText, setDropZoneText] = useState(t("dropZoneDefaultText"));
  const [dropZoneTextColor, setDropZoneTextColor] = useState(
    defaultDropzoneTextColor,
  );

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
                props.maxFilesToSelectAtOnce,
                props.maxFilesToUpload - files.length,
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
              (props.maxFilesToUpload - files.length) +
              ")",
          );
          break;
        default:
          setDropZoneText(t("dropZoneDefaultErrorMsg"));
      }
    },
    [files.length, props.maxFilesToSelectAtOnce, props.maxFilesToUpload, t],
  );

  // Is called when the selected/dropped files are accepted
  const onDropAccepted = useCallback(
    acceptedFiles => {
      // Check if the max number of files to upload would be exceeded with the new selected files.
      // If not, add the new files to the files array.
      if (files.length + acceptedFiles.length > props.maxFilesToUpload) {
        const errorCode = "max-upload-reached";
        showErrorMsg(errorCode);
      } else {
        setDropZoneTextColor(defaultDropzoneTextColor);
        setDropZoneText(t("dropZoneDefaultText"));
        setFiles(prevFiles => [...prevFiles, ...acceptedFiles]);
      }
    },
    [files.length, props.maxFilesToUpload, showErrorMsg, t],
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
    switch (props.acceptedFileExtension) {
      case ".pdf":
        return { "application/pdf": [".pdf"] };
      case ".csv":
        return { "text/csv": [".csv"] };
      default:
        break;
    }
  };

  // Create the dropzone
  const { getRootProps, getInputProps } = useDropzone({
    onDropRejected,
    onDropAccepted,
    maxFiles: props.maxFilesToSelectAtOnce,
    maxSize: 209715200,
    accept: setFileAcceptedFileTypes(),
    disabled: files.length >= props.maxFilesToUpload,
  });

  return (
    <div className="dropzone-wrapper">
      <Container minHeight={"4vh"} {...getRootProps()}>
        <p style={{ marginBottom: "0", color: dropZoneTextColor }}>
          {dropZoneText}
        </p>
        <input {...getInputProps()} />
      </Container>
      {files.length > 0 ? (
        <div
          style={{
            backgroundColor: "#ffffff",
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
                  label={file.name}
                  variant="outlined"
                  onDelete={() => removeFile(file)}
                />
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
};
