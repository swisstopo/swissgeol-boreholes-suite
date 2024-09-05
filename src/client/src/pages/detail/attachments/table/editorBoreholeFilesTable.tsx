import { ChangeEvent, FC, useContext, useEffect, useRef, useState } from "react";

import {
  detachBoreholeAttachment,
  getBoreholeAttachments,
  updateBoreholeAttachment,
  uploadBoreholeAttachment,
} from "../../../../api/fetchApiV2";

import FilesTableComponent from "./filesTableComponent";
import { Box, Button, Input } from "@mui/material";
import { AlertContext } from "../../../../components/alert/alertContext.tsx";
import { FileResponse } from "../fileInterfaces.ts";
import { useTranslation } from "react-i18next";
import UploadIcon from "../../../../assets/icons/upload.svg?react";

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
      const response = await getBoreholeAttachments(id);
      if (response) {
        setFiles(response);
      }
    }
  };

  const uploadFile = async (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target?.files && e.target?.files.length > 0) {
      const file = e.target?.files[0];
      const maxSizeInBytes = 210_000_000; // 200 MB

      if (file && file.size <= maxSizeInBytes) {
        const formData = new FormData();
        formData.append("file", file);

        const uploadResponse = await uploadBoreholeAttachment(id, formData);
        if (!uploadResponse.ok) {
          if (uploadResponse.status === 400) {
            showAlert(t("errorDuplicatedUploadPerBorehole"), "error");
          } else {
            showAlert(t("errorDuringBoreholeFileUpload"), "error");
          }
        } else {
          loadFiles();
        }
      } else {
        showAlert(t("maxfileSizeExceeded") + " (200 MB)", "error");
      }
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
      updateBoreholeAttachment(id, fid, currentDescription, value);
    } else {
      if (patchQueued) {
        clearTimeout(patchQueued);
        setPatchQueued(undefined);
      }
      setPatchQueued(
        setTimeout(() => {
          updateBoreholeAttachment(id, fid, value, currentIsPublic);
        }, 250),
      );
    }
  };

  return id ? (
    <div className="flex_col flex_fill" style={{ overflowY: "hidden" }}>
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
                onChange={uploadFile}
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
          detachBoreholeAttachment(id, fid).then(() => {
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
    </div>
  ) : (
    "nothing selected"
  );
};

export default EditorBoreholeFilesTable;
