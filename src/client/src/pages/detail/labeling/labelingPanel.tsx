import { Box, ToggleButton, ToggleButtonGroup } from "@mui/material";
import { PanelPosition, useLabelingContext } from "./labelingInterfaces.tsx";
import { PanelBottom, PanelRight } from "lucide-react";
import { FC, MouseEvent, useCallback, useEffect, useState } from "react";
import { theme } from "../../../AppTheme.ts";
import { File, FileResponse } from "../attachments/fileInterfaces.ts";
import { getBoreholeAttachments } from "../../../api/fetchApiV2";
import LabelingFileSelector from "./labelingFileSelector.tsx";

interface LabelingPanelProps {
  boreholeId: number;
}

const LabelingPanel: FC<LabelingPanelProps> = ({ boreholeId }) => {
  const { panelPosition, setPanelPosition } = useLabelingContext();
  const [isLoadingFiles, setIsLoadingFiles] = useState(true);
  const [files, setFiles] = useState<File[]>();
  const [selectedFile, setSelectedFile] = useState<File>();

  const loadFiles = useCallback(async () => {
    if (boreholeId) {
      setIsLoadingFiles(true);
      const response: FileResponse[] = await getBoreholeAttachments(boreholeId);
      if (response) {
        setFiles(response.map((fileResponse: FileResponse) => fileResponse.file));
      }
    }
    setIsLoadingFiles(false);
  }, [boreholeId]);

  const addFile = () => {};

  useEffect(() => {
    if (files === undefined) {
      loadFiles();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Box
      sx={{
        backgroundColor: theme.palette.ai.background,
        height: panelPosition === "bottom" ? "50%" : "100%",
        width: panelPosition === "right" ? "50%" : "100%",
      }}
      data-cy="labeling-panel">
      <ToggleButtonGroup
        value={panelPosition}
        onChange={(event: MouseEvent<HTMLElement>, nextPosition: PanelPosition) => {
          setPanelPosition(nextPosition);
        }}
        exclusive
        sx={{
          position: "absolute",
          bottom: "10px",
          right: "10px",
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
        <div></div>
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
