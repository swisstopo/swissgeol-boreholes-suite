import { FC, useState } from "react";
import { Box, CircularProgress, Stack } from "@mui/material";
import { BoreholeAttachment } from "../../../../../api/apiInterfaces.ts";
import { useExtractStratigraphies } from "../../../../../api/file/file.ts";
import { theme } from "../../../../../AppTheme.ts";
import { ExtractionImageContainer } from "../../../labeling/extractionImageContainer.tsx";
import { PageSelection } from "../../../labeling/pageSelection.tsx";
import { useCompletedLayers } from "../stratigraphyV2/lithologyV2/useCompletedLayers.tsx";
import { ExtractedStratigraphyTable } from "./extractedStratigraphyTable.tsx";

interface StratigraphyExtractionViewProps {
  file: BoreholeAttachment;
}

export const StratigraphyExtractionView: FC<StratigraphyExtractionViewProps> = ({ file }) => {
  const { data: lithologicalDescriptions = [], isLoading } = useExtractStratigraphies(file);
  const { completedLayers: completedLithologicalDescriptions } = useCompletedLayers(lithologicalDescriptions);
  const [activePage, setActivePage] = useState<number>(1);
  const [pageCount, setPageCount] = useState<number>();

  return (
    <Box sx={{ height: "calc(100vh - 156px - 84px)", overflow: "auto" }}>
      <Stack direction="row" spacing={4} sx={{ height: "100%" }}>
        <Stack direction="column" justifyContent="center" alignItems="center" sx={{ width: "calc(50% - 32px)" }}>
          {isLoading ? (
            <CircularProgress />
          ) : (
            <ExtractedStratigraphyTable lithologicalDescriptions={completedLithologicalDescriptions} />
          )}
        </Stack>
        <Stack
          direction="column"
          justifyContent="flex-end"
          sx={{
            backgroundColor: theme.palette.ai.background,
            border: `1px solid ${theme.palette.ai.background}`,
            borderRight: 0,
            borderBottom: 0,
            width: "50%",
            position: "fixed",
            right: theme.spacing(4),
            top: theme.spacing(11),
            bottom: theme.spacing(12.5),
          }}>
          <ExtractionImageContainer
            extractedDescriptions={lithologicalDescriptions}
            currentPageNumber={activePage}
            selectedFile={file}
            activePage={activePage}
            setActivePage={setActivePage}
            setPageCount={setPageCount}
          />
          <Box p={2} sx={{ zIndex: 500 }}>
            <PageSelection pageCount={pageCount} activePage={activePage} setActivePage={setActivePage} />
          </Box>
        </Stack>
      </Stack>
    </Box>
  );
};
