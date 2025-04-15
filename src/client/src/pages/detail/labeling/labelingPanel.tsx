import { FC, MouseEvent, useCallback, useContext, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";
import { Alert, Box, Stack, ToggleButton, ToggleButtonGroup } from "@mui/material";
import { styled } from "@mui/system";
import { PanelBottom, PanelRight } from "lucide-react";
import { ApiError, BoreholeAttachment } from "../../../api/apiInterfaces.ts";
import { getPhotosByBoreholeId } from "../../../api/fetchApiV2.ts";
import {
  extractCoordinates,
  extractText,
  fetchExtractionBoundingBoxes,
  getDataExtractionFileInfo,
  getFiles,
  uploadFile,
} from "../../../api/file/file.ts";
import { BoreholeFile, DataExtractionResponse, maxFileSizeKB } from "../../../api/file/fileInterfaces.ts";
import { theme } from "../../../AppTheme.ts";
import { useAlertManager } from "../../../components/alert/alertManager.tsx";
import { TextExtractionButton } from "../../../components/buttons/labelingButtons.tsx";
import { DetailContext } from "../detailContext.tsx";
import { FloatingExtractionFeedback } from "./floatingExtractionFeedback.tsx";
import { useLabelingContext } from "./labelingContext.tsx";
import { LabelingDrawContainer } from "./labelingDrawContainer.tsx";
import LabelingFileSelector from "./labelingFileSelector.tsx";
import { LabelingHeader } from "./labelingHeader.tsx";
import {
  ExtractionBoundingBox,
  ExtractionRequest,
  ExtractionState,
  labelingFileFormat,
  matchesFileFormat,
  PanelPosition,
  PanelTab,
} from "./labelingInterfaces.tsx";
import { labelingButtonStyles } from "./labelingStyles.ts";
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
  const { id: boreholeId } = useParams<{ id: string }>();
  const {
    panelPosition,
    setPanelPosition,
    extractionObject,
    setExtractionObject,
    setExtractionState,
    extractionState,
    panelTab,
  } = useLabelingContext();
  const [isLoadingFiles, setIsLoadingFiles] = useState(true);
  const [files, setFiles] = useState<BoreholeAttachment[]>();
  const [selectedFile, setSelectedFile] = useState<BoreholeAttachment>();
  const [fileInfo, setFileInfo] = useState<DataExtractionResponse>();
  const [pageBoundingBoxes, setPageBoundingBoxes] = useState<ExtractionBoundingBox[]>([]);
  const [activePage, setActivePage] = useState<number>(1);
  const [drawTooltipLabel, setDrawTooltipLabel] = useState<string>();
  const [extractionExtent, setExtractionExtent] = useState<number[]>([]);
  const [abortController, setAbortController] = useState<AbortController>();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { alertIsOpen, text, severity, autoHideDuration, showAlert, closeAlert } = useAlertManager();
  const { editingEnabled } = useContext(DetailContext);
  const expectedFileFormat = labelingFileFormat[panelTab];

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

  const loadProfiles = useCallback(async () => {
    const response = await getFiles<BoreholeFile>(Number(boreholeId));
    return response
      .filter((fileResponse: BoreholeFile) => matchesFileFormat(expectedFileFormat, fileResponse.file.type))
      .map((fileResponse: BoreholeFile) => fileResponse.file);
  }, [boreholeId, expectedFileFormat]);

  const loadPhotos = useCallback(async () => {
    return await getPhotosByBoreholeId(Number(boreholeId));
  }, [boreholeId]);

  const loadFiles = useCallback(async () => {
    if (boreholeId) {
      setIsLoadingFiles(true);
      try {
        const files = panelTab === PanelTab.profile ? await loadProfiles() : await loadPhotos();
        setFiles(files);
      } finally {
        setIsLoadingFiles(false);
      }
    }
  }, [boreholeId, loadPhotos, loadProfiles, panelTab]);

  const addFile = useCallback(
    async (file: File) => {
      uploadFile<BoreholeFile>(Number(boreholeId), file)
        .then(fileResponse => {
          setSelectedFile(fileResponse.file);
          loadFiles();
        })
        .catch(error => {
          showAlert(t(error.message), "error");
        });
    },
    [boreholeId, loadFiles, showAlert, t],
  );

  const setTextToClipboard = useCallback(
    async (text: string) => {
      try {
        await navigator.clipboard.writeText(text);
        const successText = `${t("copiedToClipboard")}: "${text}"`;
        showAlert(successText.length < 50 ? successText : successText.substring(0, 50) + "...", "info");
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (err) {
        showAlert(t("errorCopyingToClipboard"), "error");
      }
    },
    [showAlert, t],
  );

  const triggerDataExtraction = useCallback(
    (extent: number[]) => {
      if (fileInfo && extractionObject?.type) {
        const bbox = {
          x0: Math.min(...[extent[0], extent[2]]),
          y0: Math.min(...[extent[1], extent[3]]),
          x1: Math.max(...[extent[0], extent[2]]),
          y1: Math.max(...[extent[1], extent[3]]),
        };
        setExtractionExtent([]);
        const request: ExtractionRequest = {
          filename: fileInfo.fileName.substring(0, fileInfo.fileName.lastIndexOf("-")) + ".pdf",
          page_number: activePage,
          bbox: bbox,
          format: extractionObject.type,
        };
        setExtractionState(ExtractionState.loading);
        setDrawTooltipLabel(undefined);
        const abortController = new AbortController();
        setAbortController(abortController);
        const extractFunction = extractionObject.type === "coordinates" ? extractCoordinates : extractText;
        extractFunction(request, abortController.signal)
          .then(response => {
            if (extractionObject.type) {
              setExtractionState(ExtractionState.success);
              setExtractionObject({
                ...extractionObject,
                value: response[extractionObject.type],
              });
            }
            if (extractionObject.type === "text") {
              setTextToClipboard(response[extractionObject.type].toString());
            }
          })
          .catch(error => {
            if (!error?.toString().includes("AbortError")) {
              setExtractionState(ExtractionState.error);
              showAlert(t(error.message), "error");
            }
          })
          .finally(() => {
            setAbortController(undefined);
          });
      }
    },
    [activePage, extractionObject, fileInfo, setExtractionObject, setExtractionState, setTextToClipboard, showAlert, t],
  );

  useEffect(() => {
    if (extractionExtent?.length > 0) {
      triggerDataExtraction(extractionExtent);
    }
  }, [extractionExtent, triggerDataExtraction]);

  const cancelRequest = () => {
    if (abortController) {
      abortController.abort();
      setAbortController(undefined);
    }
    setExtractionObject({ type: "coordinates" });
    setExtractionState(ExtractionState.start);
    setExtractionExtent([]);
  };

  useEffect(() => {
    loadFiles();
  }, [loadFiles]);

  useEffect(() => {
    if (extractionState === ExtractionState.start) {
      closeAlert();
      setExtractionState(ExtractionState.drawing);
      if (extractionObject?.type === "coordinates") {
        setDrawTooltipLabel("drawCoordinateBox");
      }
    }
  }, [closeAlert, extractionObject, extractionState, setExtractionObject, setExtractionState]);

  useEffect(() => {
    if (!selectedFile) return;

    const fetchExtractionData = async () => {
      const fileInfoResponse = await getDataExtractionFileInfo(selectedFile.id, activePage);
      const { fileName, count } = fileInfoResponse;
      let newActivePage = activePage;
      if (fileInfo?.count !== count) {
        newActivePage = 1;
        setActivePage(newActivePage);
      }
      if (fileInfo?.fileName !== fileName) {
        setFileInfo(fileInfoResponse);
        try {
          const boundingBoxResponse = await fetchExtractionBoundingBoxes(selectedFile.nameUuid, newActivePage);
          setPageBoundingBoxes(boundingBoxResponse.bounding_boxes);
        } catch (error) {
          if (error instanceof ApiError) {
            showAlert(t(error.message), "warning");
          } else {
            showAlert(t("errorDataExtractionFetchBoundingBoxes"), "warning");
          }
        }
      }
    };

    fetchExtractionData();
  }, [activePage, selectedFile, fileInfo?.count, fileInfo?.fileName, showAlert, t, editingEnabled]);

  useEffect(() => {
    if (files && files.length > 0 && (panelTab === PanelTab.photo || files.length === 1)) {
      setSelectedFile(files[0]);
    } else {
      setSelectedFile(undefined);
    }
    setActivePage(1);
  }, [files, panelTab]);

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
        selectedFile={selectedFile}
        setSelectedFile={setSelectedFile}
        setActivePage={setActivePage}
        files={files}
        fileInputRef={fileInputRef}
      />
      <input
        type="file"
        ref={fileInputRef}
        style={{ display: "none" }}
        accept={expectedFileFormat}
        onChange={event => {
          const file = event.target.files?.[0];
          if (file) {
            if (file.size >= maxFileSizeKB) {
              showAlert(t("fileMaxSizeExceeded"), "error");
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
        {panelTab === PanelTab.profile && selectedFile && fileInfo?.count && (
          <PageSelection
            count={fileInfo.count}
            activePage={activePage}
            setActivePage={setActivePage}
            sx={labelingButtonStyles}
          />
        )}
        {panelTab === PanelTab.photo && selectedFile && files && (
          <PageSelection
            count={files.length}
            activePage={files.indexOf(selectedFile) + 1}
            setActivePage={page => setSelectedFile(files[page - 1])}
            sx={labelingButtonStyles}
          />
        )}
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
      {selectedFile ? (
        <Box sx={{ height: "100%", width: "100%", position: "relative" }}>
          <Box
            sx={{
              position: "absolute",
              top: theme.spacing(2),
              left: theme.spacing(2),
              zIndex: "500",
            }}>
            {editingEnabled && (
              <TextExtractionButton
                disabled={extractionObject?.type == "text" && extractionState === ExtractionState.drawing}
                onClick={() => {
                  setExtractionObject({ type: "text" });
                  setExtractionState(ExtractionState.start);
                  setDrawTooltipLabel("drawTextBox");
                }}
              />
            )}
          </Box>
          <FloatingExtractionFeedback
            isExtractionLoading={isExtractionLoading}
            cancelRequest={cancelRequest}
            text={text}
            severity={severity}
            closeAlert={closeAlert}
            alertIsOpen={alertIsOpen}
          />
          <LabelingDrawContainer
            fileInfo={fileInfo}
            onDrawEnd={setExtractionExtent}
            drawTooltipLabel={drawTooltipLabel}
            boundingBoxes={pageBoundingBoxes}
            extractionType={extractionObject?.type}
          />
        </Box>
      ) : (
        <LabelingFileSelector
          activeTab={panelTab}
          isLoadingFiles={isLoadingFiles}
          files={files}
          setSelectedFile={setSelectedFile}
          addFile={addFile}
          showAlert={showAlert}
        />
      )}
    </Stack>
  );
};

export default LabelingPanel;
