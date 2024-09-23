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
import {
  ExtractionRequest,
  ExtractionResponse,
  ExtractionState,
  labelingFileFormat,
  PanelPosition,
  useLabelingContext,
} from "./labelingInterfaces.tsx";
import { ChevronLeft, ChevronRight, FileIcon, PanelBottom, PanelRight, Plus, X } from "lucide-react";
import { FC, MouseEvent, useCallback, useEffect, useRef, useState } from "react";
import { theme } from "../../../AppTheme.ts";
import {
  DataExtractionResponse,
  File as FileInterface,
  FileResponse,
  maxFileSizeKB,
} from "../../../api/file/fileInterfaces.ts";
import LabelingFileSelector from "./labelingFileSelector.tsx";
import { getDataExtractionFileInfo, getFiles, uploadFile } from "../../../api/file/file.ts";
import { useTranslation } from "react-i18next";
import { ButtonSelect } from "../../../components/buttons/buttonSelect.tsx";
import { ReferenceSystemKey } from "../form/location/coordinateSegmentInterfaces.ts";
import { LabelingDrawContainer } from "./labelingDrawContainer.tsx";
import { useAlertManager } from "../../../components/alert/alertManager.tsx";
import { styled } from "@mui/system";

export const LabelingAlert = styled(Alert)({
  height: "44px",
  boxShadow:
    "0px 3px 1px -2px rgba(0, 0, 0, 0.2), 0px 2px 2px 0px rgba(0, 0, 0, 0.14), 0px 1px 5px 0px rgba(0, 0, 0, 0.12)",
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

interface LabelingPanelProps {
  boreholeId: number;
}

const LabelingPanel: FC<LabelingPanelProps> = ({ boreholeId }) => {
  const { t } = useTranslation();
  const { panelPosition, setPanelPosition, extractionObject, setExtractionObject } = useLabelingContext();
  const [isLoadingFiles, setIsLoadingFiles] = useState(true);
  const [files, setFiles] = useState<FileInterface[]>();
  const [selectedFile, setSelectedFile] = useState<FileInterface>();
  const [fileInfo, setFileInfo] = useState<DataExtractionResponse>();
  const [activePage, setActivePage] = useState<number>(1);
  const [drawTooltipLabel, setDrawTooltipLabel] = useState<string>();
  const [requestTimeout, setRequestTimeout] = useState<NodeJS.Timeout>();
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
      getFiles<FileResponse>(boreholeId)
        .then(response =>
          setFiles(
            response
              .filter((fileResponse: FileResponse) => fileResponse.file.type === labelingFileFormat)
              .map((fileResponse: FileResponse) => fileResponse.file),
          ),
        )
        .finally(() => {
          setIsLoadingFiles(false);
        });
    }
  }, [boreholeId]);

  const addFile = useCallback(
    async (file: File) => {
      uploadFile<FileResponse>(boreholeId, file)
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

  const extractData = useCallback(
    (extent: number[]) => {
      if (fileInfo) {
        const bbox = {
          x0: extent[0],
          y0: extent[1],
          x1: extent[2],
          y1: extent[3],
        };
        const request: ExtractionRequest = {
          filename: fileInfo.fileName.substring(0, fileInfo.fileName.lastIndexOf("-")),
          page_number: activePage,
          bounding_box: bbox,
        };
        setExtractionObject({
          ...extractionObject,
          state: ExtractionState.loading,
        });
        setDrawTooltipLabel(undefined);
        // TODO: Send coordinates to labeling api to extract data
        console.log("Request", request);
        setRequestTimeout(
          setTimeout(() => {
            const response: ExtractionResponse = {
              value: { east: 2600000 + extent[0], north: 1200000 + extent[1], projection: ReferenceSystemKey.LV95 },
              bbox: bbox,
            };
            setExtractionObject({
              ...extractionObject,
              state: ExtractionState.success,
              result: response,
            });
          }, 4000),
        );
      }
    },
    [activePage, extractionObject, fileInfo, setExtractionObject],
  );

  const cancelRequest = () => {
    clearTimeout(requestTimeout);
    setExtractionObject({ type: "coordinates", state: ExtractionState.start });
  };

  useEffect(() => {
    if (files === undefined) {
      loadFiles();
    }
  }, [files, loadFiles]);

  useEffect(() => {
    if (extractionObject?.state === ExtractionState.start) {
      setExtractionObject({
        ...extractionObject,
        state: ExtractionState.drawing,
      });
      if (extractionObject.type === "coordinates") {
        setDrawTooltipLabel("drawCoordinateBox");
      }
    }
  }, [extractionObject, setExtractionObject]);

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
              height: "44px",
              visibility: selectedFile ? "visible" : "hidden",
            }}>
            <Typography
              variant="h6"
              sx={{ alignContent: "center", padding: 1, paddingRight: fileInfo.count > 1 ? 0 : 1, margin: 0.5 }}>
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
                  disabled={activePage === 1}>
                  <ChevronLeft />
                </Button>
                <Button
                  variant="text"
                  color="secondary"
                  onClick={() => {
                    setActivePage(activePage + 1);
                  }}
                  disabled={activePage === fileInfo.count}>
                  <ChevronRight />
                </Button>
              </>
            )}
          </ButtonGroup>
        )}
        <Box>
          {alertIsOpen ? (
            <LabelingAlert variant="filled" severity={severity} onClose={closeAlert}>
              {text}
            </LabelingAlert>
          ) : (
            extractionObject?.state === ExtractionState.loading && (
              <Button
                onClick={() => cancelRequest()}
                variant="text"
                endIcon={<X />}
                sx={{
                  height: "44px",
                  boxShadow:
                    "0px 3px 1px -2px rgba(0, 0, 0, 0.2), 0px 2px 2px 0px rgba(0, 0, 0, 0.14), 0px 1px 5px 0px rgba(0, 0, 0, 0.12)",
                }}>
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
          exclusive>
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
              sx={{
                height: "44px",
                boxShadow:
                  "0px 3px 1px -2px rgba(0, 0, 0, 0.2), 0px 2px 2px 0px rgba(0, 0, 0, 0.14), 0px 1px 5px 0px rgba(0, 0, 0, 0.12)",
              }}
            />
          </Stack>
          <LabelingDrawContainer fileInfo={fileInfo} onDrawEnd={extractData} drawTooltipLabel={drawTooltipLabel} />
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
