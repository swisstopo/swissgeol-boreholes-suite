import { Box, Button, CircularProgress, Divider, Stack, Typography } from "@mui/material";
import { File as FileInterface, maxFileSizeKB } from "../../../api/file/fileInterfaces.ts";
import { File as FileIcon } from "lucide-react";
import { AddButton } from "../../../components/buttons/buttons.tsx";
import { FC, useCallback, useContext, useRef } from "react";
import { useTranslation } from "react-i18next";
import { FileRejection, useDropzone } from "react-dropzone";
import { AlertContext } from "../../../components/alert/alertContext.tsx";
import { labelingFileFormat } from "./labelingInterfaces.tsx";

interface LabelingFileSelectorProps {
  isLoadingFiles: boolean;
  files?: FileInterface[];
  setSelectedFile: (file: FileInterface) => void;
  addFile: (file: File) => void;
}

const LabelingFileSelector: FC<LabelingFileSelectorProps> = ({ isLoadingFiles, files, setSelectedFile, addFile }) => {
  const { t } = useTranslation();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { showAlert } = useContext(AlertContext);

  const onDrop = useCallback(
    (acceptedFiles: File[], fileRejections: FileRejection[]) => {
      if (fileRejections.length > 0) {
        const errorCode = fileRejections[0].errors[0].code;
        switch (errorCode) {
          case "file-invalid-type":
            showAlert(t("fileInvalidType"), "error");
            break;
          case "too-many-files":
            showAlert(t("fileTooMany"), "error");
            break;
          case "file-too-large":
            showAlert(t("fileMaxSizeExceeded"), "error");
            break;
          default:
            showAlert(fileRejections[0].errors[0].message, "error");
            break;
        }
      } else {
        addFile(acceptedFiles[0]);
      }
    },
    [addFile, showAlert, t],
  );

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    maxFiles: 1,
    maxSize: maxFileSizeKB,
    accept: {
      [labelingFileFormat]: [],
    },
    noDrag: false,
    noClick: true,
  });

  return (
    <Box
      style={{ padding: "84px 50px", height: "100%", width: "100%", cursor: "pointer" }}
      {...getRootProps()}
      onDragOver={e => {
        e.stopPropagation();
        e.preventDefault();
        e.dataTransfer.dropEffect = "copy";
      }}>
      <input {...getInputProps()} data-cy="labeling-file-dropzone" ref={fileInputRef} />
      <Stack
        sx={{
          justifyContent: "center",
          alignItems: "center",
          height: "100%",
          width: "100%",
          border: "2px solid transparent",
          borderImage: "repeating-linear-gradient(45deg, #ffffff, #ffffff 10px, transparent 10px, transparent 20px) 1",
        }}>
        <Stack
          sx={{
            backgroundColor: "#ffffff",
            padding: 2,
            width: "292px",
            borderRadius: "4px",
            gap: 2,
          }}
          onDragOver={e => {
            e.stopPropagation();
            e.preventDefault();
            e.dataTransfer.dropEffect = "none";
          }}
          data-cy="labeling-file-selector">
          <Typography variant="h6" sx={{ fontWeight: "700" }}>
            {t("existingFiles")}
          </Typography>
          <Stack gap={1}>
            {isLoadingFiles ? (
              <Stack direction="row" sx={{ justifyContent: "center" }}>
                <CircularProgress />
              </Stack>
            ) : files && files.length > 0 ? (
              files.map((file: FileInterface) => (
                <Button
                  key={file.name}
                  startIcon={<FileIcon />}
                  variant="outlined"
                  sx={{ justifyContent: "start" }}
                  onClick={event => {
                    event.stopPropagation();
                    setSelectedFile(file);
                  }}>
                  <Box sx={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{file.name}</Box>
                </Button>
              ))
            ) : (
              <Typography variant="body1">{t("noFiles")}</Typography>
            )}
          </Stack>
          <Divider />
          <AddButton variant="contained" label="addFile" onClick={() => fileInputRef.current?.click()} />
        </Stack>
      </Stack>
    </Box>
  );
};

export default LabelingFileSelector;
