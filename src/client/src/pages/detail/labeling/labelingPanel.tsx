import { FC, MouseEvent, useCallback, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Alert, Box, Stack, ToggleButton, ToggleButtonGroup } from "@mui/material";
import { styled } from "@mui/system";
import { PanelBottom, PanelRight } from "lucide-react";
import { BoreholeAttachment, Photo } from "../../../api/apiInterfaces.ts";
import { getPhotoImageData, getPhotosByBoreholeId, uploadPhoto } from "../../../api/fetchApiV2.ts";
import { uploadFile } from "../../../api/file/file.ts";
import { File as FileInterface, FileSizeLimit, maxFileSizeBytes } from "../../../api/file/fileInterfaces.ts";
import { theme } from "../../../AppTheme.ts";
import { useAlertManager } from "../../../components/alert/alertManager.tsx";
import { useRequiredParams } from "../../../hooks/useRequiredParams.ts";
import { useInvalidateProfiles, useProfiles } from "../attachments/useProfiles.tsx";
import { FloatingExtractionFeedback } from "./floatingExtractionFeedback.tsx";
import { useLabelingContext } from "./labelingContext.tsx";
import { LabelingExtraction } from "./labelingExtraction.tsx";
import LabelingFileSelector from "./labelingFileSelector.tsx";
import { LabelingHeader } from "./labelingHeader.tsx";
import {
  ExtractionState,
  labelingFileFormat,
  matchesFileFormat,
  PanelPosition,
  PanelTab,
} from "./labelingInterfaces.tsx";
import { labelingButtonStyles } from "./labelingStyles.ts";
import { LabelingView } from "./labelingView.tsx";
import { PageSelection } from "./pageSelection.tsx";

export const LabelingAlert = styled(Alert)({
  ...labelingButtonStyles,
  maxWidth: "100%",
  display: "flex",
  alignItems: "center",
  " & .MuiAlert-icon": {
    padding: "0",
    alignItems: "center",
    justifyContent: "center",
  },
  " & .MuiAlert-message": {
    flex: 1,
    padding: 0,
    minWidth: 0,
    overflow: "hidden",
    whiteSpace: "nowrap",
    textOverflow: "ellipsis",
    maxWidth: "100%",
  },
  " & .MuiAlert-action": {
    flexShrink: 0,
    alignItems: "center",
    justifyContent: "center",
    padding: "0 0 0 16px",
  },
});

const LabelingPanel: FC = () => {
  const { t } = useTranslation();
  const { id: boreholeId } = useRequiredParams<{ id: string }>();
  const { panelPosition, setPanelPosition, extractionState, fileInfo, cancelRequest, panelTab } = useLabelingContext();
  const [isLoadingFiles, setIsLoadingFiles] = useState(true);
  const [files, setFiles] = useState<BoreholeAttachment[]>();
  const [selectedAttachment, setSelectedAttachment] = useState<BoreholeAttachment>();
  const [activePage, setActivePage] = useState<number>(1);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { alertIsOpen, text, severity, autoHideDuration, showAlert, closeAlert } = useAlertManager();
  const { data: profiles } = useProfiles(boreholeId);
  const invalidateProfiles = useInvalidateProfiles();

  const expectedFileFormat = labelingFileFormat[panelTab];
  const isPhotoSelected = selectedAttachment && "fromDepth" in selectedAttachment;
  const selectedFile: FileInterface | undefined = isPhotoSelected ? undefined : selectedAttachment;
  const selectedPhoto: Photo | undefined = isPhotoSelected ? selectedAttachment : undefined;
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (alertIsOpen && autoHideDuration !== null) {
      timer = setTimeout(() => {
        closeAlert();
      }, autoHideDuration);
    }
    // Clear timeout on unmount
    return () => clearTimeout(timer);
  }, [alertIsOpen, autoHideDuration, closeAlert]);

  const loadPhotos = useCallback(async () => {
    const photos = await getPhotosByBoreholeId(Number(boreholeId));
    return photos;
  }, [boreholeId]);

  const loadFiles = useCallback(async () => {
    if (boreholeId) {
      setIsLoadingFiles(true);
      try {
        const files = panelTab === PanelTab.profile ? profiles : await loadPhotos();
        setFiles(files);
        if (files?.length === 1) {
          setSelectedAttachment(selected => selected ?? files[0]);
        } else if (!files || files.length === 0) {
          setSelectedAttachment(undefined);
          setActivePage(1);
        }
      } finally {
        setIsLoadingFiles(false);
      }
    }
  }, [profiles, boreholeId, loadPhotos, panelTab]);

  const addFile = useCallback(
    async (file: File) => {
      try {
        if (panelTab === PanelTab.profile) {
          const fileResponse = await uploadFile(Number(boreholeId), file);
          setSelectedAttachment(fileResponse.file);
          invalidateProfiles();
        } else {
          const photoResponse = await uploadPhoto(Number(boreholeId), file);
          setSelectedAttachment(photoResponse);
          loadFiles();
        }
      } catch (error) {
        showAlert(t((error as Error).message), "error");
      }
    },
    [boreholeId, invalidateProfiles, loadFiles, panelTab, showAlert, t],
  );

  const loadSelectedPhoto = useCallback(async () => {
    if (selectedPhoto) {
      return await getPhotoImageData(selectedPhoto.id);
    }
    return null;
  }, [selectedPhoto]);

  useEffect(() => {
    loadFiles();
  }, [loadFiles]);

  const isExtractionLoading = extractionState === ExtractionState.loading;
  return (
    <Stack
      sx={{
        backgroundColor: theme.palette.ai.background,
        border: `1px solid ${theme.palette.ai.background}`,
        borderRight: 0,
        borderBottom: 0,
        height: panelPosition === "bottom" ? "50%" : "100%",
        width: panelPosition === "right" ? "50%" : "100%",
        position: "relative",
      }}
      data-cy="labeling-panel">
      <LabelingHeader
        selectedAttachment={selectedAttachment}
        setSelectedAttachment={setSelectedAttachment}
        setActivePage={setActivePage}
        files={files}
        fileInputRef={fileInputRef}
        showSearch={panelTab === PanelTab.photo}
      />
      <input
        type="file"
        ref={fileInputRef}
        style={{ display: "none" }}
        accept={expectedFileFormat}
        onChange={event => {
          const file = event.target.files?.[0];
          if (file) {
            if (file.size >= maxFileSizeBytes) {
              showAlert(t("fileMaxSizeExceeded", { size: FileSizeLimit.Standard }), "error");
            } else if (!matchesFileFormat(expectedFileFormat, file.type)) {
              showAlert(t("fileInvalidType"), "error");
            } else {
              addFile(file);
            }
          }
        }}
      />
      <Stack
        m={2}
        direction="row"
        justifyContent="space-between"
        sx={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: "500",
        }}>
        <Box>
          {panelTab === PanelTab.profile && selectedFile && fileInfo?.count && (
            <PageSelection pageCount={fileInfo.count} activePage={activePage} setActivePage={setActivePage} />
          )}
          {panelTab === PanelTab.photo && selectedPhoto && files && (
            <PageSelection
              pageCount={files.length}
              activePage={files.findIndex(f => f.id === selectedPhoto.id) + 1}
              setActivePage={page => setSelectedAttachment(files[page - 1])}
            />
          )}
        </Box>
        <ToggleButtonGroup
          value={panelPosition}
          onChange={(event: MouseEvent<HTMLElement>, nextPosition: PanelPosition) => {
            if (nextPosition) {
              setPanelPosition(nextPosition);
            }
          }}
          exclusive
          sx={labelingButtonStyles}>
          <ToggleButton value="bottom" data-cy="labeling-panel-position-bottom">
            <PanelBottom />
          </ToggleButton>
          <ToggleButton value="right" data-cy="labeling-panel-position-right">
            <PanelRight />
          </ToggleButton>
        </ToggleButtonGroup>
      </Stack>
      {selectedAttachment ? (
        <Box sx={{ height: "100%", width: "100%", position: "relative" }}>
          <FloatingExtractionFeedback
            isExtractionLoading={isExtractionLoading}
            cancelRequest={cancelRequest}
            text={text}
            severity={severity}
            closeAlert={closeAlert}
            alertIsOpen={alertIsOpen}
          />
          {panelTab === PanelTab.profile ? (
            <LabelingExtraction
              selectedFile={selectedFile}
              activePage={activePage}
              setActivePage={setActivePage}
              showAlert={showAlert}
              closeAlert={closeAlert}
            />
          ) : (
            <LabelingView fileName={selectedPhoto?.nameUuid} loadImage={loadSelectedPhoto} />
          )}
        </Box>
      ) : (
        <LabelingFileSelector
          activeTab={panelTab}
          isLoadingFiles={isLoadingFiles}
          files={files}
          setSelectedFile={setSelectedAttachment}
          addFile={addFile}
          showAlert={showAlert}
        />
      )}
    </Stack>
  );
};

export default LabelingPanel;
