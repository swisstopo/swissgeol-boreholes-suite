import { ChangeEvent, FC, useCallback, useContext, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Box, Button, Input, Stack, Typography } from "@mui/material";
import UploadIcon from "../../../../assets/icons/upload.svg?react";
import { detachFile, getFiles, updateFile, uploadFile } from "../../../../api/file/file.ts";
import { BoreholeFile } from "../../../../api/file/fileInterfaces.ts";
import { theme } from "../../../../AppTheme.ts";
import { AlertContext } from "../../../../components/alert/alertContext.tsx";
import { FullPageCentered, StackFullWidth } from "../../../../components/styledComponents.ts";
import { DetailContext } from "../../detailContext.tsx";
import { FilesTable } from "./filesTable.tsx";

interface ProfilesProps {
  boreholeId: number;
}

export const Profiles: FC<ProfilesProps> = ({ boreholeId }) => {
  const { t } = useTranslation();
  const formRef = useRef<HTMLFormElement>(null);
  const [files, setFiles] = useState<BoreholeFile[]>([]);
  const [patchQueued, setPatchQueued] = useState<NodeJS.Timeout | string | number | undefined>();
  const { showAlert } = useContext(AlertContext);
  const { editingEnabled } = useContext(DetailContext);

  const loadFiles = useCallback(() => {
    getFiles<BoreholeFile>(boreholeId).then(setFiles);
  }, [boreholeId]);

  useEffect(() => {
    loadFiles();
  }, [loadFiles]);

  const upload = async (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target?.files && e.target?.files.length > 0) {
      const file = e.target?.files[0];

      await uploadFile(boreholeId, file)
        .then(() => loadFiles())
        .catch(error => {
          showAlert(t(error.message), "error");
        });
    }
    formRef.current?.reset();
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
    <Box
      sx={{
        height: "100%",
        maxWidth: "100%",
        px: 3,
        pb: 10,
        pt: 3,
        backgroundColor: theme.palette.background.default,
        border: `1px solid ${theme.palette.border.light}`,
        flex: "1 1.5 100%",
      }}>
      <StackFullWidth
        direction="column"
        sx={{
          height: "100%",
        }}>
        <Stack
          direction="row"
          justifyContent="flex-end"
          mb={3}
          sx={{
            visibility: editingEnabled ? "visible" : "hidden",
          }}>
          <form ref={formRef}>
            <Button
              data-cy="attachments-upload-button"
              component="label"
              role={undefined}
              variant="outlined"
              tabIndex={-1}
              endIcon={<UploadIcon />}>
              {t("upload")}
              <Input
                type="file"
                onChange={upload}
                sx={{
                  clip: "rect(0 0 0 0)",
                  clipPath: "inset(50%)",
                  height: 1,
                  overflow: "hidden",
                  position: "absolute",
                  bottom: 0,
                  left: 0,
                  whiteSpace: "nowrap",
                  width: 1,
                }}
              />
            </Button>
          </form>
        </Stack>

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
            <Typography variant="fullPageMessage">{t("noAttachments")}</Typography>
          </FullPageCentered>
        )}
      </StackFullWidth>
    </Box>
  );
};
