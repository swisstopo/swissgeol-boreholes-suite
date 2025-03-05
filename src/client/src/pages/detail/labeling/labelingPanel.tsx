import { FC, MouseEvent, useCallback, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";
import {
  Alert,
  Box,
  Button,
  ButtonGroup,
  CircularProgress,
  Stack,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from "@mui/material";
import { styled } from "@mui/system";
import { ChevronLeft, ChevronRight, FileIcon, PanelBottom, PanelRight, Plus, X } from "lucide-react";
import { extractData, getDataExtractionFileInfo, getFiles, uploadFile } from "../../../api/file/file.ts";
import {
  BoreholeFile,
  DataExtractionResponse,
  File as FileInterface,
  maxFileSizeKB,
} from "../../../api/file/fileInterfaces.ts";
import { theme } from "../../../AppTheme.ts";
import { useAlertManager } from "../../../components/alert/alertManager.tsx";
import { ButtonSelect } from "../../../components/buttons/buttonSelect.tsx";
import { LabelingDrawContainer } from "./labelingDrawContainer.tsx";
import LabelingFileSelector from "./labelingFileSelector.tsx";
import {
  ExtractionRequest,
  ExtractionState,
  labelingFileFormat,
  PanelPosition,
  useLabelingContext,
} from "./labelingInterfaces.tsx";

const labelingButtonStyles = {
  boxShadow: theme.shadows[1],
  height: "44px",
};

export const LabelingAlert = styled(Alert)({
  ...labelingButtonStyles,
  " & .MuiAlert-icon": {
    padding: "0",
    alignItems: "center",
    justifyContent: "center",
  },
  " & .MuiAlert-message": {
    padding: "0",
    display: "flex",
    alignItems: "center",
  },
  " & .MuiAlert-action": {
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
  const [activePage, setActivePage] = useState<number>(1);
  const [drawTooltipLabel, setDrawTooltipLabel] = useState<string>();
  const [extractionExtent, setExtractionExtent] = useState<number[]>([]);
  const [abortController, setAbortController] = useState<AbortController>();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { alertIsOpen, text, severity, autoHideDuration, showAlert, closeAlert } = useAlertManager();

  useEffect(() => {
    if (alertIsOpen && autoHideDuration !== null) {
      setTimeout(() => {
        closeAlert();
      }, autoHideDuration);
    }
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

  const handleFileInputClick = () => {
    fileInputRef.current?.click();
  };

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
        extractData(request, abortController.signal)
          .then(response => {
            if (extractionObject.type) {
              setExtractionState(ExtractionState.success);
              setExtractionObject({
                ...extractionObject,
                value: response[extractionObject.type],
              });
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
    [activePage, extractionObject, fileInfo, setExtractionObject, setExtractionState, showAlert, t],
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
      setExtractionState(ExtractionState.drawing);
      if (extractionObject?.type === "coordinates") {
        setDrawTooltipLabel("drawCoordinateBox");
      }
    }
  }, [extractionObject, extractionState, setExtractionObject, setExtractionState]);

  useEffect(() => {
    if (selectedFile) {
      getDataExtractionFileInfo(selectedFile.id, activePage).then(response => {
        if (fileInfo?.count !== response.count) {
          setActivePage(1);
        }
        if (fileInfo !== response) {
          setFileInfo(response);
        }
      });
    }
    // Adding fileInfo to dependencies would cause an infinite loop
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activePage, selectedFile]);

  return (
    <Box
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
        <Box>
          {alertIsOpen ? (
            <LabelingAlert data-cy="labeling-alert" variant="filled" severity={severity} onClose={closeAlert}>
              {text}
            </LabelingAlert>
          ) : (
            extractionState === ExtractionState.loading && (
              <Button onClick={() => cancelRequest()} variant="text" endIcon={<X />} sx={labelingButtonStyles}>
                <CircularProgress sx={{ marginRight: "15px", width: "15px !important", height: "15px !important" }} />
                {t("analyze")}
              </Button>
            )
          )}
        </Box>
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
          <Stack
            direction="row"
            sx={{
              position: "absolute",
              top: theme.spacing(2),
              left: theme.spacing(2),
              zIndex: "500",
              gap: 1,
            }}>
            <ButtonSelect
              fieldName="labeling-file"
              startIcon={<FileIcon />}
              items={[
                ...(files?.map(file => ({ key: file.id, value: file.name })) || []),
                { key: -1, value: t("addFile"), startIcon: <Plus /> },
              ]}
              selectedItem={{ key: selectedFile?.id, value: selectedFile?.name }}
              onItemSelected={item => {
                setActivePage(1);
                if (item.key === -1) {
                  handleFileInputClick();
                } else {
                  setSelectedFile(files?.find(file => file.id === item.key));
                }
              }}
              sx={labelingButtonStyles}
            />
          </Stack>
          <LabelingDrawContainer
            fileInfo={fileInfo}
            onDrawEnd={setExtractionExtent}
            drawTooltipLabel={drawTooltipLabel}
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
    </Box>
  );
};

export default LabelingPanel;
