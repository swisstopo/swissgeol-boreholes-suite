import { Box, Button, ButtonGroup, Stack, ToggleButton, ToggleButtonGroup, Typography } from "@mui/material";
import { labelingFileFormat, PanelPosition, useLabelingContext } from "./labelingInterfaces.tsx";
import { ChevronLeft, ChevronRight, FileIcon, PanelBottom, PanelRight, Plus } from "lucide-react";
import { FC, MouseEvent, useCallback, useContext, useEffect, useRef, useState } from "react";
import { theme } from "../../../AppTheme.ts";
import { File as FileInterface, FileResponse, maxFileSizeKB } from "../../../api/file/fileInterfaces.ts";
import LabelingFileSelector from "./labelingFileSelector.tsx";
import { getDataExtractionFile, getFiles, uploadFile } from "../../../api/file/file.ts";
import { AlertContext } from "../../../components/alert/alertContext.tsx";
import { useTranslation } from "react-i18next";
import ImageLayer from "ol/layer/Image.js";
import Map from "ol/Map.js";
import Projection from "ol/proj/Projection.js";
import Static from "ol/source/ImageStatic.js";
import View from "ol/View.js";
import { getCenter } from "ol/extent.js";
import ZoomControls from "../../../components/buttons/zoomControls";
import { ButtonSelect } from "../../../components/buttons/buttonSelect.tsx";
import { defaults as defaultControls } from "ol/control/defaults";

interface LabelingPanelProps {
  boreholeId: number;
}

const LabelingPanel: FC<LabelingPanelProps> = ({ boreholeId }) => {
  const { t } = useTranslation();
  const { panelPosition, setPanelPosition } = useLabelingContext();
  const [isLoadingFiles, setIsLoadingFiles] = useState(true);
  const [files, setFiles] = useState<FileInterface[]>();
  const [selectedFile, setSelectedFile] = useState<FileInterface>();
  const [pageCount, setPageCount] = useState<number>(1);
  const [activePage, setActivePage] = useState<number>(1);
  const [map, setMap] = useState<Map>();
  const [extent, setExtent] = useState<number[]>();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { showAlert } = useContext(AlertContext);

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

  const zoomIn = () => {
    if (map) {
      const view = map.getView();
      const zoom = view.getZoom();
      if (zoom) {
        view.setZoom(zoom + 1);
      }
    }
  };

  const zoomOut = () => {
    if (map) {
      const view = map.getView();
      const zoom = view.getZoom();
      if (zoom) {
        view.setZoom(zoom - 1);
      }
    }
  };

  const fitToExtent = () => {
    if (map && extent) {
      const view = map.getView();
      view.fit(extent, { size: map.getSize() });
    }
  };

  useEffect(() => {
    if (files === undefined) {
      loadFiles();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (selectedFile) {
      getDataExtractionFile(selectedFile.id, activePage).then(response => {
        if (pageCount !== response.count) {
          setPageCount(response.count);
          if (activePage > response.count) {
            setActivePage(1);
          }
        }

        // const extent = [0, 0, response.width, response.height];
        const extent = [0, 0, 1024, 968];
        setExtent(extent);

        const projection = new Projection({
          code: "xkcd-image",
          units: "pixels",
          extent: extent,
        });

        // const fileLayer = new ImageLayer({
        //   source: new Static({
        //     url: response.url,
        //     projection: projection,
        //     imageExtent: extent,
        //   }),
        // });
        const fileLayer = new ImageLayer({
          source: new Static({
            url: "https://imgs.xkcd.com/comics/online_communities.png",
            projection: projection,
            imageExtent: extent,
          }),
        });

        const map = new Map({
          layers: [fileLayer],
          target: "map",
          view: new View({
            minResolution: 0.1,
            zoom: 0,
            projection: projection,
            center: getCenter(extent),
            extent: extent,
            showFullExtent: true,
          }),
          controls: defaultControls({
            attribution: false,
            zoom: false,
          }),
        });
        setMap(map);
      });
    }
  }, [selectedFile, activePage, pageCount]);

  return (
    <Box
      sx={{
        backgroundColor: theme.palette.ai.background,
        height: panelPosition === "bottom" ? "50%" : "100%",
        width: panelPosition === "right" ? "50%" : "100%",
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
      <ToggleButtonGroup
        value={panelPosition}
        onChange={(event: MouseEvent<HTMLElement>, nextPosition: PanelPosition) => {
          setPanelPosition(nextPosition);
        }}
        exclusive
        sx={{
          position: "absolute",
          bottom: "16px",
          right: "16px",
          zIndex: "500",
        }}>
        <ToggleButton value="bottom" data-cy="labeling-panel-position-bottom">
          <PanelBottom />
        </ToggleButton>
        <ToggleButton value="right" data-cy="labeling-panel-position-right">
          <PanelRight />
        </ToggleButton>
      </ToggleButtonGroup>
      {selectedFile ? (
        <Box sx={{ height: "100%", width: "100%", position: "relative" }}>
          <Stack
            direction="row"
            sx={{
              position: "absolute",
              top: "16px",
              left: "16px",
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
              sx={{ height: "44px" }}
            />
          </Stack>
          <ZoomControls onZoomIn={zoomIn} onZoomOut={zoomOut} onFitToExtent={fitToExtent} />
          <ButtonGroup
            variant="contained"
            sx={{
              position: "absolute",
              bottom: "16px",
              left: "16px",
              zIndex: "500",
              height: "44px",
            }}>
            <Typography
              variant="h6"
              sx={{ alignContent: "center", padding: 1, paddingRight: pageCount > 1 ? 0 : 1, margin: 0.5 }}>
              {activePage} / {pageCount}
            </Typography>
            {pageCount > 1 && (
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
                  disabled={activePage === pageCount}>
                  <ChevronRight />
                </Button>
              </>
            )}
          </ButtonGroup>
          <Box id="map" sx={{ height: "100%", width: "100%", position: "absolute" }} />
        </Box>
      ) : (
        <LabelingFileSelector
          isLoadingFiles={isLoadingFiles}
          files={files}
          setSelectedFile={setSelectedFile}
          addFile={addFile}
        />
      )}
    </Box>
  );
};

export default LabelingPanel;
