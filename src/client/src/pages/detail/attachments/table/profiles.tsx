import { FC, useCallback, useContext, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Box, Typography } from "@mui/material";
import { detachFile, getFiles, updateFile, uploadFile } from "../../../../api/file/file.ts";
import { BoreholeFile } from "../../../../api/file/fileInterfaces.ts";
import { AlertContext } from "../../../../components/alert/alertContext.tsx";
import { FullPageCentered } from "../../../../components/styledComponents.ts";
import { AddAttachmentButton } from "../addAttachmentButton.tsx";
import { FilesTable } from "./filesTable.tsx";

interface ProfilesProps {
  boreholeId: number;
}

export const Profiles: FC<ProfilesProps> = ({ boreholeId }) => {
  const { t } = useTranslation();
  const [files, setFiles] = useState<BoreholeFile[]>([]);
  const [patchQueued, setPatchQueued] = useState<NodeJS.Timeout | string | number | undefined>();
  const { showAlert } = useContext(AlertContext);

  const loadFiles = useCallback(() => {
    getFiles<BoreholeFile>(boreholeId).then(setFiles);
  }, [boreholeId]);

  useEffect(() => {
    loadFiles();
  }, [loadFiles]);

  const upload = async (file: File) => {
    await uploadFile(boreholeId, file)
      .then(() => loadFiles())
      .catch(error => {
        showAlert(t(error.message), "error");
      });
  };

  const patch = (
    id: string,
    fid: number,
    currentDescription: string,
    currentIsPublic: boolean,
    field: string,
    value: string | boolean,
  ) => {
    setFiles(files.map(file => (file.fileId === fid ? { ...file, [field]: value } : file)));
    if (field === "public") {
      updateFile(id, fid, currentDescription, value as boolean);
    } else {
      if (patchQueued) {
        clearTimeout(patchQueued);
        setPatchQueued(undefined);
      }
      setPatchQueued(
        setTimeout(() => {
          updateFile(id, fid, value as string, currentIsPublic);
        }, 250),
      );
    }
  };

  return (
    <>
      <AddAttachmentButton label="addProfile" onFileSelect={upload} dataCy="attachments-upload-button" />

      {files && files.length > 0 ? (
        <Box sx={{ height: "100%" }}>
          <FilesTable
            detachFile={(id: string, fid: number) => {
              detachFile(id, fid).then(() => {
                loadFiles();
              });
            }}
            editor
            files={files}
            patchFile={patch}
          />
        </Box>
      ) : (
        <FullPageCentered>
          <Typography variant="fullPageMessage">{t("noProfiles")}</Typography>
        </FullPageCentered>
      )}
    </>
  );
};
