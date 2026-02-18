import { FC, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { CircularProgress, Dialog, DialogProps, Typography } from "@mui/material";
import { Stack } from "@mui/system";
import { FileTextIcon } from "lucide-react";
import { BoreholeAttachment } from "../../../../../api/apiInterfaces.ts";
import { uploadFile } from "../../../../../api/file/file.ts";
import { AddFileButton } from "../../../../../components/buttons/addFileButton.tsx";
import { CancelButton, FileButton } from "../../../../../components/buttons/buttons.tsx";
import {
  DialogFooterContainer,
  DialogHeaderContainer,
  DialogMainContent,
} from "../../../../../components/styledComponents.ts";
import { useInvalidateProfiles, useProfiles } from "../../../attachments/useProfiles.tsx";
import { labelingFileFormat } from "../../../labeling/labelingInterfaces.tsx";

interface ProfileFilePickerProps {
  boreholeId: string;
  open: boolean;
  setOpen: (open: boolean) => void;
  setSelectedFile: (file: BoreholeAttachment | undefined) => void;
}

export const ProfileFilePicker: FC<ProfileFilePickerProps> = ({ boreholeId, open, setOpen, setSelectedFile }) => {
  const { t } = useTranslation();
  const { data: files, isLoading: isLoadingFiles } = useProfiles(boreholeId);
  const invalidateProfiles = useInvalidateProfiles();

  const closeDialog = useCallback(() => {
    setOpen(false);
  }, [setOpen]);

  const handleClose: DialogProps["onClose"] = () => {
    closeDialog();
  };

  const selectFile = useCallback(
    (file: BoreholeAttachment) => {
      setSelectedFile(file);
      closeDialog();
    },
    [closeDialog, setSelectedFile],
  );

  const addFile = useCallback(
    async (file: File) => {
      const fileResponse = await uploadFile(Number(boreholeId), file);
      selectFile(fileResponse.file);
      invalidateProfiles();
    },
    [boreholeId, invalidateProfiles, selectFile],
  );

  const getFilesButtons = () => {
    return files && files?.length > 0 ? (
      files.map(file => (
        <FileButton key={file.name} label={file.name} icon={<FileTextIcon />} onClick={() => selectFile(file)} />
      ))
    ) : (
      <Typography variant="body1">{t("noProfilesUploaded")}</Typography>
    );
  };

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
        <Typography variant="h4">{t("extractStratigraphyFromProfile")}</Typography>
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
            ) : (
              getFilesButtons()
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
        <CancelButton onClick={closeDialog} />
      </DialogFooterContainer>
    </Dialog>
  );
};
