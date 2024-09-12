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
        const errorMessages: { [key: string]: string } = {
          "file-invalid-type": t("fileInvalidType"),
          "too-many-files": t("fileTooMany"),
          "file-too-large": t("fileMaxSizeExceeded"),
        };
        showAlert(errorMessages[errorCode] || fileRejections[0].errors[0].message, "error");
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
    accept: { [labelingFileFormat]: [] },
    noDrag: false,
    noClick: true,
  });

  return (
    <Box
      sx={{ py: 10.5, px: 6, height: "100%", width: "100%", cursor: "pointer" }}
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
          borderRadius: "24px",
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='100%25' height='100%25' xmlns='http://www.w3.org/2000/svg'%3E%3Crect width='100%25' height='100%25' fill='none' rx='24' ry='24' stroke='%23fff' stroke-width='4' stroke-dasharray='12%2C 24' stroke-dashoffset='0' stroke-linecap='square'/%3E%3C/svg%3E")`,
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
