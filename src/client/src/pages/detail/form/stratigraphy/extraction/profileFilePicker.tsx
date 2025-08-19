import { FC, useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { CircularProgress, Dialog, DialogProps, Typography } from "@mui/material";
import { Stack } from "@mui/system";
import { FileTextIcon } from "lucide-react";
import { BoreholeAttachment } from "../../../../../api/apiInterfaces.ts";
import { getFiles, uploadFile } from "../../../../../api/file/file.ts";
import { BoreholeFile } from "../../../../../api/file/fileInterfaces.ts";
import { AddFileButton } from "../../../../../components/buttons/addFileButton.tsx";
import { CancelButton, FileButton } from "../../../../../components/buttons/buttons.tsx";
import {
  DialogFooterContainer,
  DialogHeaderContainer,
  DialogMainContent,
} from "../../../../../components/styledComponents.ts";
import { labelingFileFormat, matchesFileFormat, PanelTab } from "../../../labeling/labelingInterfaces.tsx";

interface ProfileFilePickerProps {
  boreholeId: string;
  open: boolean;
  setOpen: (open: boolean) => void;
  setSelectedFile: (file: BoreholeAttachment | undefined) => void;
}

export const ProfileFilePicker: FC<ProfileFilePickerProps> = ({ boreholeId, open, setOpen, setSelectedFile }) => {
  const { t } = useTranslation();
  const [files, setFiles] = useState<BoreholeAttachment[]>();
  const [isLoadingFiles, setIsLoadingFiles] = useState(true);
  const closeDialog = () => {
    setOpen(false);
  };

  const handleClose: DialogProps["onClose"] = () => {
    closeDialog();
  };

  const loadFiles = useCallback(async () => {
    if (boreholeId) {
      setIsLoadingFiles(true);
      try {
        const response = await getFiles<BoreholeFile>(Number(boreholeId));
        const profiles = response
          .filter((fileResponse: BoreholeFile) =>
            matchesFileFormat(labelingFileFormat[PanelTab.profile], fileResponse.file.type),
          )
          .map((fileResponse: BoreholeFile) => fileResponse.file);
        if (profiles.length === 1) {
          setSelectedFile(profiles[0]);
        }
        setFiles(profiles);
      } finally {
        setIsLoadingFiles(false);
      }
    }
  }, [boreholeId, setSelectedFile]);

  const addFile = useCallback(
    async (file: File) => {
      const fileResponse = await uploadFile(Number(boreholeId), file);
      setSelectedFile(fileResponse.file);
    },
    [boreholeId, setSelectedFile],
  );

  useEffect(() => {
    void loadFiles();
  }, [loadFiles]);

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="md"
      sx={{
        "& .MuiDialog-paper": {
          width: "420px",
        },
      }}>
      <DialogHeaderContainer>
        <Stack direction="row">
          <Typography variant="h4">{t("extractStratigraphyFromProfile")}</Typography>
        </Stack>
      </DialogHeaderContainer>
      <DialogMainContent>
        <Stack gap={1.5}>
          <Typography variant="h6" color={"text.primary"} fontWeight={"700"}>
            {t("profiles")}
          </Typography>
          <Stack gap={1} mb={1.5} sx={{ maxHeight: "246px", overflowY: "auto" }}>
            {isLoadingFiles ? (
              <Stack direction="row" sx={{ justifyContent: "center", color: "text.primary" }}>
                <CircularProgress />
              </Stack>
            ) : files && files.length > 0 ? (
              files.map(file => (
                <FileButton
                  key={file.name}
                  label={file.name}
                  icon={<FileTextIcon />}
                  onClick={() => setSelectedFile(file)}
                />
              ))
            ) : (
              <Typography variant="body1">{t("noProfilesUploaded")}</Typography>
            )}
          </Stack>
          <AddFileButton
            label={"addProfile"}
            onFileSelect={addFile}
            sx={{ width: "100%" }}
            acceptedFileTypes={labelingFileFormat.profile}
          />
        </Stack>
      </DialogMainContent>
      <DialogFooterContainer>
        <Stack direction="row" justifyContent="flex-end" alignItems="center">
          <CancelButton onClick={closeDialog} />
        </Stack>
      </DialogFooterContainer>
    </Dialog>
  );
};
