import { FC, useState } from "react";
import { useTranslation } from "react-i18next";
import { Box, CircularProgress, Stack, Typography } from "@mui/material";
import { ExtractedStratigraphy } from "../../../../../api/dataextraction.ts";
import { BoreholeAttachment } from "../../../../../api/unionTypes.ts";
import { theme } from "../../../../../AppTheme.ts";
import { ExtractionImageContainer } from "../../../labeling/extractionImageContainer.tsx";
import { PageSelection } from "../../../labeling/pageSelection.tsx";
import { PagesBadge } from "./pagesBadge.tsx";
import { StratigraphyExtractionItem, StratigraphyExtractionItemState } from "./stratigraphyExtractionItem.tsx";

interface StratigraphyExtractionViewProps {
  file: BoreholeAttachment;
  allExtractedStratigraphies: ExtractedStratigraphy[];
  selectedIndex: number;
  onItemStateChange: (index: number, state: StratigraphyExtractionItemState) => void;
  isLoading: boolean;
  activePage: number;
  setActivePage: (page: number) => void;
}

export const StratigraphyExtractionView: FC<StratigraphyExtractionViewProps> = ({
  file,
  allExtractedStratigraphies,
  selectedIndex,
  onItemStateChange,
  isLoading,
  activePage,
  setActivePage,
}) => {
  const { t } = useTranslation();
  const [pageCount, setPageCount] = useState<number>();

  const selectedStratigraphy = allExtractedStratigraphies[selectedIndex];
  const currentPageRange = selectedStratigraphy?.pageNumbers;
  const rawDescriptions = selectedStratigraphy?.descriptions ?? [];

  const renderExtractionItems = () => {
    if (isLoading) {
      return (
        <Stack sx={{ height: "100%", width: "100%" }} justifyContent="center" alignItems="center">
          <CircularProgress />
        </Stack>
      );
    }
    if (allExtractedStratigraphies.length === 0) {
      return <Typography>{t("msgNoStratigraphyExtracted")}</Typography>;
    }
    return allExtractedStratigraphies.map((stratigraphy, index) => (
      <StratigraphyExtractionItem
        key={`stratigraphy-${stratigraphy.pageNumbers.join("-")}`}
        index={index}
        descriptions={stratigraphy.descriptions}
        visible={index === selectedIndex}
        onStateChange={onItemStateChange}
      />
    ));
  };

  return (
    <Stack direction="row" sx={{ height: "100%", minHeight: 0 }}>
      <Stack sx={{ flex: 1, minHeight: 0, overflow: "auto", padding: 3 }}>{renderExtractionItems()}</Stack>
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
          extractedDescriptions={rawDescriptions}
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
