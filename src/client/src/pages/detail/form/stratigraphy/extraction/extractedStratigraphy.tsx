import { FC, ReactNode, useState } from "react";
import { useTranslation } from "react-i18next";
import { Box, CircularProgress, Stack, Typography } from "@mui/material";
import { BoreholeAttachment } from "../../../../../api/apiInterfaces.ts";
import { useExtractStratigraphiesQuery } from "../../../../../api/file/file.ts";
import { BaseLayer, LithologicalDescription } from "../../../../../api/stratigraphy.ts";
import { theme } from "../../../../../AppTheme.ts";
import { LabelingExtraction } from "../../../labeling/labelingExtraction.tsx";
import { PageSelection } from "../../../labeling/pageSelection.tsx";
import { useCompletedLayers } from "../stratigraphyV2/lithologyV2/useCompletedLayers.tsx";
import {
  StratigraphyTableActionCell,
  StratigraphyTableCell,
  StratigraphyTableColumn,
  StratigraphyTableContent,
  StratigraphyTableGap,
  StratigraphyTableHeader,
  StratigraphyTableHeaderCell,
} from "../stratigraphyV2/stratigraphyTableComponents.tsx";

interface ExtractedStratigraphyProps {
  file: BoreholeAttachment;
}

export const ExtractedStratigraphy: FC<ExtractedStratigraphyProps> = ({ file }) => {
  const { data: lithologicalDescriptions = [], isLoading, isFetching } = useExtractStratigraphiesQuery(file);
  const { completedLayers: completedLithologicalDescriptions } = useCompletedLayers(lithologicalDescriptions);
  const { t } = useTranslation();
  const [activePage, setActivePage] = useState<number>(1);
  const [pageCount, setPageCount] = useState<number>();
  const defaultRowHeight = 240;

  const renderTableCells = (layers: BaseLayer[], buildContent: (layer: BaseLayer) => ReactNode, keyPrefix: string) => {
    if (!layers || layers.length === 0) {
      return (
        <StratigraphyTableGap
          key={`${keyPrefix}-new`}
          sx={{ height: `${defaultRowHeight}px` }}
          layer={{ id: 0, stratigraphyId: stratigraphyId, isGap: true, fromDepth: -1, toDepth: -1 }}
        />
      );
    }

    const renderGap = (layer: BaseLayer) => (
      <StratigraphyTableGap
        key={`${keyPrefix}-${layer.id}`}
        sx={{
          height: `${defaultRowHeight}px`,
        }}
        layer={layer}
      />
    );

    const renderActionCell = (layer: BaseLayer) => (
      <StratigraphyTableActionCell
        key={`${keyPrefix}-${layer.id}`}
        sx={{
          height: `${defaultRowHeight}px`,
        }}
        layer={layer}>
        {buildContent(layer)}
      </StratigraphyTableActionCell>
    );

    return layers.map(layer => (layer.isGap ? renderGap(layer) : renderActionCell(layer)));
  };

  if (isFetching) {
    console.log("Background fetching in progess...");
  }

  return (
    <Box sx={{ height: "calc(100vh - 156px - 84px)", overflow: "auto" }}>
      <Stack direction="row" spacing={4} sx={{ height: "100%" }}>
        <Stack direction="column" justifyContent="center" alignItems="center" sx={{ width: "calc(50% - 32px)" }}>
          {isLoading ? (
            <CircularProgress />
          ) : (
            <Box sx={{ height: "100%" }}>
              <StratigraphyTableHeader sx={{ width: "100%" }}>
                <StratigraphyTableHeaderCell sx={{ flex: "0 0 90px" }} label={t("depth")} />
                <StratigraphyTableHeaderCell label={t("lithological_description")} />
              </StratigraphyTableHeader>
              <StratigraphyTableContent>
                <StratigraphyTableColumn sx={{ flex: "0 0 90px" }}>
                  {!completedLithologicalDescriptions || completedLithologicalDescriptions.length === 0 ? (
                    <StratigraphyTableCell>empty</StratigraphyTableCell>
                  ) : (
                    completedLithologicalDescriptions.map((desc, index) => (
                      <StratigraphyTableCell key={`depth-${index}`} sx={{ height: `${defaultRowHeight}px` }}>
                        <Typography>{`${desc.fromDepth} m MD`}</Typography>
                        <Typography>{`${desc.toDepth} m MD`}</Typography>
                      </StratigraphyTableCell>
                    ))
                  )}
                </StratigraphyTableColumn>
                <StratigraphyTableColumn>
                  {renderTableCells(
                    completedLithologicalDescriptions,
                    layer => (
                      <Typography variant="body1" fontWeight={700}>
                        {(layer as LithologicalDescription).description}
                      </Typography>
                    ),
                    "lithologicalDescription",
                  )}
                </StratigraphyTableColumn>
              </StratigraphyTableContent>
            </Box>
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
          <LabelingExtraction
            selectedFile={file}
            activePage={activePage}
            setActivePage={setActivePage}
            setPageCount={setPageCount}
            isReadonly={true}
          />
          <Box p={2} sx={{ zIndex: 500 }}>
            <PageSelection pageCount={pageCount} activePage={activePage} setActivePage={setActivePage} />
          </Box>
        </Stack>
      </Stack>
    </Box>
  );
};
