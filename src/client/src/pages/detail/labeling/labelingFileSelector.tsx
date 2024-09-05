import { Box, Button, CircularProgress, Divider, Typography } from "@mui/material";
import { File as FileInterface } from "../attachments/fileInterfaces.ts";
import { File as FileIcon } from "lucide-react";
import { AddButton } from "../../../components/buttons/buttons.tsx";
import { FC, useCallback, useRef } from "react";
import { useTranslation } from "react-i18next";
import { FileRejection, useDropzone } from "react-dropzone";

interface LabelingFileSelectorProps {
  isLoadingFiles: boolean;
  files?: FileInterface[];
  setSelectedFile: (file: FileInterface) => void;
  addFile: () => void;
}

const LabelingFileSelector: FC<LabelingFileSelectorProps> = ({ isLoadingFiles, files, setSelectedFile, addFile }) => {
  const { t } = useTranslation();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const onDrop = useCallback((acceptedFiles: File[], fileRejections: FileRejection[]) => {
    if (fileRejections.length > 0) {
      console.error(fileRejections[0].errors[0].message);
    } else {
      console.log("acceptedFiles", acceptedFiles);
    }
  }, []);

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    maxFiles: 1,
    maxSize: 210000000,
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
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          height: "100%",
          width: "100%",
          border: "2px solid transparent",
          borderImage: "repeating-linear-gradient(45deg, #ffffff, #ffffff 10px, transparent 10px, transparent 20px) 1",
        }}>
        <Box
          sx={{
            backgroundColor: "#ffffff",
            padding: "16px 16px 16px 11px",
            width: "292px",
            borderRadius: "4px",
            display: "flex",
            flexDirection: "column",
            gap: "12px",
          }}
          onDragOver={e => {
            e.stopPropagation();
            e.preventDefault();
            e.dataTransfer.dropEffect = "none";
          }}>
          <Typography variant="h6" sx={{ fontWeight: "700", marginLeft: "5px" }}>
            {t("existingFiles")}
          </Typography>
          <Box sx={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            {isLoadingFiles ? (
              <Box sx={{ marginLeft: "5px", display: "flex", flexDirection: "row", justifyContent: "center" }}>
                <CircularProgress />
              </Box>
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
                  {file.name}
                </Button>
              ))
            ) : (
              <Typography variant="body1" sx={{ marginLeft: "5px" }}>
                {t("noFiles")}
              </Typography>
            )}
          </Box>
          <Divider sx={{ marginLeft: "5px" }} />
          <AddButton variant="contained" label="addFile" onClick={() => fileInputRef.current?.click()} />
        </Box>
      </Box>
    </Box>
  );
};

export default LabelingFileSelector;
