import { FC, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { CircularProgress, Dialog, DialogProps, Typography } from "@mui/material";
import { Stack } from "@mui/system";
import { FileTextIcon } from "lucide-react";
import { BoreholeAttachment } from "../../../../../api/apiInterfaces.ts";
import { labelingFileFormat } from "../../../../../api/dataextractionInterfaces.ts";
import { uploadProfile, useProfiles, useReloadProfiles } from "../../../../../api/profile.ts";
import { AddFileButton } from "../../../../../components/buttons/addFileButton.tsx";
import { CancelButton, FileButton } from "../../../../../components/buttons/buttons.tsx";
import {
  DialogFooterContainer,
  DialogHeaderContainer,
  DialogMainContent,
} from "../../../../../components/styledComponents.ts";

interface ProfileFilePickerProps {
  boreholeId: string;
  open: boolean;
  setOpen: (open: boolean) => void;
  setSelectedFile: (file: BoreholeAttachment | undefined) => void;
}

export const ProfileFilePicker: FC<ProfileFilePickerProps> = ({ boreholeId, open, setOpen, setSelectedFile }) => {
  const { t } = useTranslation();
  const { data: profiles, isLoading: isLoadingFiles } = useProfiles(Number(boreholeId), true);
  const reloadProfiles = useReloadProfiles(Number(boreholeId));

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
      const fileResponse = await uploadProfile(Number(boreholeId), file);
      selectFile(fileResponse);
      reloadProfiles();
    },
    [boreholeId, reloadProfiles, selectFile],
  );

  const getFilesButtons = () => {
    return profiles && profiles?.length > 0 ? (
      profiles.map(profile => (
        <FileButton
          key={profile.name}
          label={profile.name}
          icon={<FileTextIcon />}
          onClick={() => selectFile(profile)}
        />
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
