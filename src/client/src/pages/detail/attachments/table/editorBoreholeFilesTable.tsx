import { ChangeEvent, FC, useContext, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Box, Button, Input } from "@mui/material";
import UploadIcon from "../../../../assets/icons/upload.svg?react";
import { detachFile, getFiles, updateFile, uploadFile } from "../../../../api/file/file";
import { FileResponse } from "../../../../api/file/fileInterfaces.ts";
import { theme } from "../../../../AppTheme.ts";
import { AlertContext } from "../../../../components/alert/alertContext.tsx";
import FilesTableComponent from "./filesTableComponent";

export interface EditorBoreholeFilesTable2Props {
  id: number;
  unlocked: boolean;
}

const EditorBoreholeFilesTable: FC<EditorBoreholeFilesTable2Props> = ({
  id,
  unlocked,
}: EditorBoreholeFilesTable2Props) => {
  const { t } = useTranslation();
  const formRef = useRef<HTMLFormElement>(null);
  const [files, setFiles] = useState<FileResponse[]>([]);
  const [patchQueued, setPatchQueued] = useState<NodeJS.Timeout | string | number | undefined>();
  const { showAlert } = useContext(AlertContext);

  useEffect(() => {
    loadFiles();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const loadFiles = async () => {
    if (id) {
      getFiles<FileResponse>(id).then(setFiles);
    }
  };

  const upload = async (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target?.files && e.target?.files.length > 0) {
      const file = e.target?.files[0];

      await uploadFile(id, file)
        .then(() => loadFiles())
        .catch(error => {
          showAlert(t(error.message), "error");
        });
    }
    formRef.current?.reset();
  };

  const patch = (
    id: number,
    fid: number,
    currentDescription: string,
    currentIsPublic: boolean,
    field: string,
    value: string | boolean,
  ) => {
    setFiles(
      files.map(file => {
        if (file.fileId === fid) {
          const val: { [key: string]: string | boolean } = {};
          val[field] = value;
          return Object.assign({}, file, val);
        }
        return file;
      }),
    );
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

  return id ? (
    <Box
      sx={{
        overflowY: "hidden",
        padding: 3,
        flex: "1 1 100%",
        backgroundColor: theme.palette.background.default,
        border: `1px solid ${theme.palette.boxShadow}`,
      }}>
      {unlocked && (
        <Box sx={{ display: "flex", justifyContent: "flex-end", marginBottom: "10px" }}>
          <form ref={formRef}>
            <Button
              data-cy="attachments-upload-button"
              component="label"
              role={undefined}
              variant="outlined"
              tabIndex={-1}
              endIcon={<UploadIcon />}
              sx={{
                paddingLeft: "12px",
                paddingRight: "12px",
                paddingBottom: "8px",
                paddingTop: "8px",
                whiteSpace: "nowrap",
                borderRadius: "2px",
                fontWeight: 500,
                minWidth: "auto",
              }}>
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
        </Box>
      )}
      <FilesTableComponent
        detachFile={(id: number, fid: number) => {
          detachFile(id, fid).then(() => {
            loadFiles();
          });
        }}
        editor
        files={files}
        id={id}
        patchFile={patch}
        reload={loadFiles}
        unlocked={unlocked}
      />
    </Box>
  ) : (
    "nothing selected"
  );
};

export default EditorBoreholeFilesTable;
