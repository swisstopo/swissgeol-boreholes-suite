import { FC, useState } from "react";
import { useTranslation } from "react-i18next";
import { Box, CircularProgress, Stack, Typography } from "@mui/material";
import { ExtractedStratigraphy } from "../../../../../api/dataextraction.ts";
import { BoreholeAttachment } from "../../../../../api/unionTypes.ts";
import { theme } from "../../../../../AppTheme.ts";
import { BoreholesButton } from "../../../../../components/buttons/buttons.tsx";
import { useDelayedFlag } from "../../../../../hooks/useDelayedFlag.ts";
import { ExtractionImageContainer } from "../../../labeling/extractionImageContainer.tsx";
import { PageSelection } from "../../../labeling/pageSelection.tsx";
import { PagesBadge } from "./pagesBadge.tsx";
import { StratigraphyExtractionItem, StratigraphyExtractionItemState } from "./stratigraphyExtractionItem.tsx";

export const extractionTakingLongerThresholdMs = 20000;

export interface StratigraphyExtractionViewProps {
  file: BoreholeAttachment;
  allExtractedStratigraphies: ExtractedStratigraphy[];
  selectedIndex: number;
  onItemStateChange: (index: number, state: StratigraphyExtractionItemState) => void;
  isLoading: boolean;
  isError: boolean;
  onRetry: () => void;
  activePage: number;
  setActivePage: (page: number) => void;
  names: Map<number, string>;
  nameErrors: Map<number, string>;
  onNameChange: (index: number, value: string) => void;
}

export const StratigraphyExtractionView: FC<StratigraphyExtractionViewProps> = ({
  file,
  allExtractedStratigraphies,
  selectedIndex,
  onItemStateChange,
  isLoading,
  isError,
  onRetry,
  activePage,
  setActivePage,
  names,
  nameErrors,
  onNameChange,
}) => {
  const { t } = useTranslation();
  const [pageCount, setPageCount] = useState<number>();
  const isTakingLonger = useDelayedFlag(isLoading, extractionTakingLongerThresholdMs);

  const selectedStratigraphy = allExtractedStratigraphies[selectedIndex];
  const currentPageRange = selectedStratigraphy?.pageNumbers;
  const rawDescriptions = selectedStratigraphy?.descriptions ?? [];

  const renderExtractionItems = () => {
    if (isLoading) {
      return (
        <Stack sx={{ height: "100%", width: "100%" }} justifyContent="center" alignItems="center" gap={2}>
          <CircularProgress />
          {isTakingLonger && (
            <Typography data-cy="stratigraphy-extraction-taking-longer" textAlign="center">
              {t("msgStratigraphyExtractionTakingLonger")}
            </Typography>
          )}
        </Stack>
      );
    }
    if (isError) {
      return (
        <Stack sx={{ height: "100%", width: "100%" }} justifyContent="center" alignItems="center" gap={2}>
          <Typography data-cy="stratigraphy-extraction-error" textAlign="center">
            {t("msgStratigraphyExtractionFailed")}
          </Typography>
          <BoreholesButton
            dataCy="retry-stratigraphy-extraction-button"
            variant="outlined"
            label="retry"
            onClick={onRetry}
          />
        </Stack>
      );
    }
    if (allExtractedStratigraphies.length === 0) {
      return <Typography data-cy="stratigraphy-extraction-empty">{t("msgNoStratigraphyExtracted")}</Typography>;
    }
    return allExtractedStratigraphies.map((stratigraphy, index) => (
      <StratigraphyExtractionItem
        key={`stratigraphy-${stratigraphy.pageNumbers.join("-")}`}
        index={index}
        descriptions={stratigraphy.descriptions}
        visible={index === selectedIndex}
        onStateChange={onItemStateChange}
        name={names.get(index) ?? ""}
        nameError={nameErrors.get(index)}
        onNameChange={onNameChange}
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
