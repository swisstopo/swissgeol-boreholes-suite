import { FC, useState } from "react";
import { Box, Stack } from "@mui/material";
import { BoreholeAttachment } from "../../../../../api/apiInterfaces.ts";
import { theme } from "../../../../../AppTheme.ts";
import { ExtractionImageContainer } from "../../../labeling/extractionImageContainer.tsx";
import { PageSelection } from "../../../labeling/pageSelection.tsx";
import { ExtractedLithologicalDescription } from "../lithologicalDescription.ts";
import { useCompletedLayers } from "../lithology/useCompletedLayers.tsx";
import { ExtractedStratigraphyTable } from "./extractedStratigraphyTable.tsx";
import { PagesBadge } from "./pagesBadge.tsx";

interface StratigraphyExtractionViewProps {
  file: BoreholeAttachment;
  lithologicalDescriptions: ExtractedLithologicalDescription[];
  isLoading: boolean;
  activePage: number;
  setActivePage: (page: number) => void;
  currentPageRange?: number[];
}

export const StratigraphyExtractionView: FC<StratigraphyExtractionViewProps> = ({
  file,
  lithologicalDescriptions,
  isLoading,
  activePage,
  setActivePage,
  currentPageRange,
}) => {
  const { completedLayers: completedLithologicalDescriptions } = useCompletedLayers(lithologicalDescriptions);
  const [pageCount, setPageCount] = useState<number>();

  return (
    <Stack direction="row" sx={{ height: "100%", minHeight: 0 }}>
      <Stack sx={{ flex: 1, minHeight: 0, overflow: "auto", padding: 3 }}>
        <ExtractedStratigraphyTable
          lithologicalDescriptions={completedLithologicalDescriptions}
          isLoading={isLoading}
        />
      </Stack>
      <Stack
        justifyContent="space-between"
        sx={{
          flex: 1,
          minHeight: 0,
          backgroundColor: theme.palette.ai.background,
          borderLeft: `1px solid ${theme.palette.border.light}`,
          position: "relative",
          overflow: "hidden",
        }}>
        <PagesBadge currentPageRange={currentPageRange} />
        <ExtractionImageContainer
          extractedDescriptions={lithologicalDescriptions}
          currentPageNumber={activePage}
          selectedFile={file}
          activePage={activePage}
          setActivePage={setActivePage}
          pageCount={pageCount}
          setPageCount={setPageCount}
        />
        <Box p={2} sx={{ zIndex: 500 }}>
          <PageSelection pageCount={pageCount} activePage={activePage} setActivePage={setActivePage} />
        </Box>
      </Stack>
    </Stack>
  );
};
