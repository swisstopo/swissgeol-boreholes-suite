import { FC, MouseEvent, useCallback, useContext, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";
import { Alert, Box, Button, ButtonGroup, Stack, ToggleButton, ToggleButtonGroup, Typography } from "@mui/material";
import { styled } from "@mui/system";
import { ChevronLeft, ChevronRight, PanelBottom, PanelRight } from "lucide-react";
import { ApiError } from "../../../api/apiInterfaces.ts";
import {
  extractCoordinates,
  extractText,
  fetchExtractionBoundingBoxes,
  getDataExtractionFileInfo,
  getFiles,
  uploadFile,
} from "../../../api/file/file.ts";
import {
  BoreholeFile,
  DataExtractionResponse,
  File as FileInterface,
  maxFileSizeKB,
} from "../../../api/file/fileInterfaces.ts";
import { theme } from "../../../AppTheme.ts";
import { useAlertManager } from "../../../components/alert/alertManager.tsx";
import { TextExtractionButton } from "../../../components/buttons/labelingButtons.tsx";
import { DetailContext } from "../detailContext.tsx";
import { FloatingExtractionFeedback } from "./floatingExtractionFeedback.tsx";
import { LabelingDrawContainer } from "./labelingDrawContainer.tsx";
import LabelingFileSelector from "./labelingFileSelector.tsx";
import { LabelingHeader } from "./labelingHeader.tsx";
import {
  ExtractionBoundingBox,
  ExtractionRequest,
  ExtractionState,
  labelingFileFormat,
  PanelPosition,
  useLabelingContext,
} from "./labelingInterfaces.tsx";
import { labelingButtonStyles } from "./labelingStyles.ts";

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
  } = useLabelingContext();
  const [isLoadingFiles, setIsLoadingFiles] = useState(true);
  const [files, setFiles] = useState<FileInterface[]>();
  const [selectedFile, setSelectedFile] = useState<FileInterface>();
  const [fileInfo, setFileInfo] = useState<DataExtractionResponse>();
  const [pageBoundingBoxes, setPageBoundingBoxes] = useState<ExtractionBoundingBox[]>([]);
  const [activePage, setActivePage] = useState<number>(1);
  const [drawTooltipLabel, setDrawTooltipLabel] = useState<string>();
  const [extractionExtent, setExtractionExtent] = useState<number[]>([]);
  const [abortController, setAbortController] = useState<AbortController>();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { alertIsOpen, text, severity, autoHideDuration, showAlert, closeAlert } = useAlertManager();
  const { editingEnabled } = useContext(DetailContext);

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

  const loadFiles = useCallback(async () => {
    if (boreholeId) {
      setIsLoadingFiles(true);
      getFiles<BoreholeFile>(Number(boreholeId))
        .then(response =>
          setFiles(
            response
              .filter((fileResponse: BoreholeFile) => fileResponse.file.type === labelingFileFormat)
              .map((fileResponse: BoreholeFile) => fileResponse.file),
          ),
        )
        .finally(() => {
          setIsLoadingFiles(false);
        });
    }
  }, [boreholeId]);

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
    if (files === undefined) {
      loadFiles();
    }
  }, [files, loadFiles]);

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
  }, [activePage, selectedFile, fileInfo?.count, fileInfo?.fileName, showAlert, t]);

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
        accept={labelingFileFormat}
        onChange={event => {
          const file = event.target.files?.[0];
          if (file) {
            if (file.size >= maxFileSizeKB) {
              showAlert(t("fileMaxSizeExceeded"), "error");
            } else if (file.type !== labelingFileFormat) {
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
        {fileInfo?.count && (
          <ButtonGroup
            variant="contained"
            sx={{
              ...labelingButtonStyles,
              visibility: selectedFile ? "visible" : "hidden",
            }}>
            <Typography
              variant="h6"
              p={1}
              pr={fileInfo.count > 1 ? 0 : 1}
              m={0.5}
              sx={{ alignContent: "center" }}
              data-cy="labeling-page-count">
              {activePage} / {fileInfo.count}
            </Typography>
            {fileInfo?.count > 1 && (
              <>
                <Button
                  variant="text"
                  color="secondary"
                  onClick={() => {
                    setActivePage(activePage - 1);
                  }}
                  disabled={activePage === 1}
                  data-cy="labeling-page-previous">
                  <ChevronLeft />
                </Button>
                <Button
                  variant="text"
                  color="secondary"
                  onClick={() => {
                    setActivePage(activePage + 1);
                  }}
                  disabled={activePage === fileInfo.count}
                  data-cy="labeling-page-next">
                  <ChevronRight />
                </Button>
              </>
            )}
          </ButtonGroup>
        )}
        <ToggleButtonGroup
          value={panelPosition}
          onChange={(event: MouseEvent<HTMLElement>, nextPosition: PanelPosition) => {
            setPanelPosition(nextPosition);
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
