import { FC, useCallback, useContext, useRef } from "react";
import { FileRejection, useDropzone } from "react-dropzone";
import { useTranslation } from "react-i18next";
import { useLocation } from "react-router";
import { AlertColor, Box, CircularProgress, Divider, Stack, Typography } from "@mui/material";
import { ChevronRight, FileImageIcon, FileTextIcon } from "lucide-react";
import { BoreholeAttachment } from "../../../api/apiInterfaces.ts";
import { FileSizeLimit, maxFileSizeBytes } from "../../../api/file/fileInterfaces.ts";
import { AddButton, BoreholesBaseButton, FileButton } from "../../../components/buttons/buttons.tsx";
import { useBoreholesNavigate } from "../../../hooks/useBoreholesNavigate.tsx";
import { useRequiredParams } from "../../../hooks/useRequiredParams.ts";
import { EditStateContext } from "../editStateContext.tsx";
import { labelingFileFormat, PanelTab } from "./labelingInterfaces.tsx";

const dashedOutlineImage = `url("data:image/svg+xml,%3Csvg width='100%25' height='100%25' xmlns='http://www.w3.org/2000/svg'%3E%3Crect width='100%25' height='100%25' fill='none' rx='24' ry='24' stroke='%23fff' stroke-width='4' stroke-dasharray='12%2C 24' stroke-dashoffset='0' stroke-linecap='square'/%3E%3C/svg%3E")`;

interface LabelingFileSelectorProps {
  isLoadingFiles: boolean;
  files?: BoreholeAttachment[];
  activeTab: PanelTab;
  setSelectedFile: (file: BoreholeAttachment) => void;
  addFile: (file: File) => void;
  showAlert: (text: string, severity?: AlertColor, allowAutoHide?: boolean) => void;
}

const LabelingFileSelector: FC<LabelingFileSelectorProps> = ({
  activeTab,
  isLoadingFiles,
  files,
  setSelectedFile,
  addFile,
  showAlert,
}) => {
  const { t } = useTranslation();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { editingEnabled } = useContext(EditStateContext);
  const { id } = useRequiredParams<{ id: string }>();
  const { navigateTo } = useBoreholesNavigate();
  const location = useLocation();

  const isOnAttachmentsPage = location.pathname === `/${id}/attachments`;
  const fileUploadEnabled = editingEnabled && (activeTab === PanelTab.profile || isOnAttachmentsPage);

  const onDrop = useCallback(
    (acceptedFiles: File[], fileRejections: FileRejection[]) => {
      if (fileRejections.length > 0) {
        const errorCode = fileRejections[0].errors[0].code;
        const errorMessages: { [key: string]: string } = {
          "file-invalid-type": t("fileInvalidType"),
          "too-many-files": t("fileTooMany"),
          "file-too-large": t("fileMaxSizeExceeded", { size: FileSizeLimit.Standard }),
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
    maxSize: maxFileSizeBytes,
    accept: { [labelingFileFormat[activeTab]]: [] },
    noDrag: false,
    noClick: true,
    disabled: !fileUploadEnabled,
  });

  const getNoAttachmentText = () => {
    if (activeTab === PanelTab.profile) {
      return t("noProfilesUploaded");
    }
    if (editingEnabled && !fileUploadEnabled) {
      return `${t("noPhotosUploaded")} ${t("uploadPhotosAsAttachments")}`;
    }
    return t("noPhotosUploaded");
  };

  return (
    <Box
      sx={{ py: 10.5, px: 6, height: "100%", width: "100%" }}
      {...getRootProps()}
      onDragOver={e => {
        if (fileUploadEnabled) {
          e.stopPropagation();
          e.preventDefault();
          e.dataTransfer.dropEffect = "copy";
        }
      }}>
      <input {...getInputProps()} data-cy="labeling-file-dropzone" ref={fileInputRef} />
      <Stack
        sx={{
          justifyContent: "center",
          alignItems: "center",
          height: "100%",
          width: "100%",
          borderRadius: "24px",
          backgroundImage: fileUploadEnabled ? dashedOutlineImage : undefined,
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
          <Typography variant="h6" color={"text.primary"} fontWeight={"700"}>
            {activeTab === PanelTab.profile ? t("profiles") : t("photos")}
          </Typography>
          <Stack gap={1}>
            {isLoadingFiles ? (
              <Stack direction="row" sx={{ justifyContent: "center" }}>
                <CircularProgress />
              </Stack>
            ) : files && files.length > 0 ? (
              files.map(file => (
                <FileButton
                  key={file.name}
                  label={file.name}
                  icon={activeTab === PanelTab.profile ? <FileTextIcon /> : <FileImageIcon />}
                  onClick={() => setSelectedFile(file)}
                />
              ))
            ) : (
              <Typography variant="body1">{getNoAttachmentText()}</Typography>
            )}
          </Stack>
          {editingEnabled && (
            <>
              <Divider />
              {fileUploadEnabled ? (
                <AddButton
                  variant="contained"
                  color="primary"
                  label={activeTab === PanelTab.profile ? "addProfile" : "addPhoto"}
                  onClick={() => fileInputRef.current?.click()}
                />
              ) : (
                <BoreholesBaseButton
                  variant="contained"
                  color="primary"
                  label="managePhotos"
                  onClick={() => navigateTo({ path: `/${id}/attachments`, hash: `photos` })}
                  icon={<ChevronRight />}
                  dataCy="labeling-file-selector-manage-photos"
                />
              )}
            </>
          )}
        </Stack>
      </Stack>
    </Box>
  );
};

export default LabelingFileSelector;
