import { Box, Button, CircularProgress, Divider, Typography } from "@mui/material";
import { File } from "../attachments/fileInterfaces.ts";
import { File as FileIcon } from "lucide-react";
import { AddButton } from "../../../components/buttons/buttons.tsx";
import { FC } from "react";
import { useTranslation } from "react-i18next";

interface LabelingFileSelectorProps {
  isLoadingFiles: boolean;
  files?: File[];
  setSelectedFile: (file: File) => void;
  addFile: () => void;
}

const LabelingFileSelector: FC<LabelingFileSelectorProps> = ({ isLoadingFiles, files, setSelectedFile, addFile }) => {
  const { t } = useTranslation();

  return (
    <Box sx={{ padding: "84px 50px", height: "100%", width: "100%" }}>
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
              files.map((file: File) => (
                <Button
                  key={file.name}
                  startIcon={<FileIcon />}
                  variant="outlined"
                  sx={{ justifyContent: "start" }}
                  onClick={() => setSelectedFile(file)}>
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
          <AddButton variant="contained" label="addFile" onClick={() => addFile()} />
        </Box>
      </Box>
    </Box>
  );
};

export default LabelingFileSelector;
