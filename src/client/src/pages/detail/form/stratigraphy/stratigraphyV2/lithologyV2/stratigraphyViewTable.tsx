import { FC, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { Box, Button, Stack, SxProps, Typography } from "@mui/material";
import { ChevronDown, ChevronUp } from "lucide-react";
import { BaseLayer } from "../../../../../../api/stratigraphy.ts";
import { formatNumberForDisplay } from "../../../../../../components/form/formUtils.ts";
import {
  StratigraphyTableCellRow,
  StratigraphyTableContent,
  StratigraphyTableHeader,
  StratigraphyTableHeaderCell,
} from "../stratigraphyTableComponents.tsx";
import { BaseLayerColumn } from "./BaseLayerColumn.tsx";
import { useScaleContext } from "./scaleContext.tsx";
import { VerticalZoomPanWrapper } from "./VerticalZoomPanWrapper.tsx";

const defaultCellHeight = 36;
/*Todo: Set table height based on available space*/
const tableHeight = 600;
const scrollStep = 100;
const minTranslateY = 12;
const overviewColumnWidth = 45;

// Column configuration interface
interface ColumnConfig {
  id: string;
  layers: BaseLayer[];
  label: string;
  renderLayer: (layer: BaseLayer) => React.ReactNode;
  onCopyAction?: () => void;
  sx?: SxProps;
}

interface StratigraphyViewTableProps {
  columns: ColumnConfig[];
  depthLayers: BaseLayer[];
  showOverviewColumn?: boolean;
  overviewLayers?: BaseLayer[];
}

export const StratigraphyViewTable: FC<StratigraphyViewTableProps> = ({
  columns,
  depthLayers,
  showOverviewColumn = true,
  overviewLayers,
}) => {
  const { t } = useTranslation();
  const { scaleY, setTranslateY } = useScaleContext();

  const renderDepthColumnLayer = useCallback(
    (lithology: BaseLayer) => (
      <>
        <StratigraphyTableCellRow height={`${defaultCellHeight / scaleY}px`}>
          <Typography
            variant="body1"
            sx={{
              transform: `scaleY(${1 / scaleY})`,
              transformOrigin: "center",
            }}>
            {formatNumberForDisplay(lithology.fromDepth, 1, 1)}
          </Typography>
        </StratigraphyTableCellRow>
        <StratigraphyTableCellRow sx={{ flex: 1 }} />
        <StratigraphyTableCellRow height={`${defaultCellHeight / scaleY}px`}>
          <Typography
            variant="body1"
            sx={{
              transform: `scaleY(${1 / scaleY})`,
              transformOrigin: "center",
            }}>
            {formatNumberForDisplay(lithology.toDepth, 1, 1)}
          </Typography>
        </StratigraphyTableCellRow>
      </>
    ),
    [scaleY],
  );

  return (
    <Stack direction="row" justifyContent="flex-start" spacing={1.5} sx={{ height: "100%" }}>
      {/* Overview column */}
      {showOverviewColumn && (
        <Stack direction="column" sx={{ position: "relative", width: "45px", height: "100%" }}>
          <Box>
            <Button
              sx={{ height: `${defaultCellHeight}px`, mb: "2px" }}
              onClick={() => setTranslateY((prev: number) => Math.min(prev + scrollStep * scaleY, minTranslateY))}
              variant="outlined"
              aria-label={t("scroll_up")}>
              <ChevronUp />
            </Button>
          </Box>
          <VerticalZoomPanWrapper>
            <Stack sx={{ height: `${tableHeight}px` }}>
              <BaseLayerColumn
                isFirstColumn={true}
                layers={overviewLayers || depthLayers}
                renderLayer={() => null}
                sx={{ flex: `0 0 ${overviewColumnWidth}px` }}
                colorAttribute={"lithologyCon"}
              />
            </Stack>
          </VerticalZoomPanWrapper>
          <Box sx={{ width: `${overviewColumnWidth}px` }}>
            <Button
              sx={{ height: `${defaultCellHeight}px`, mt: "2px" }}
              onClick={() => setTranslateY((prev: number) => prev + scrollStep * scaleY)}
              variant="outlined"
              aria-label={t("scroll_down")}>
              <ChevronDown />
            </Button>
          </Box>
          <Box sx={{ width: `${overviewColumnWidth}px` }} />
        </Stack>
      )}

      {/* Table */}
      <Stack sx={{ flex: 1, pb: "38px" }}>
        <StratigraphyTableHeader>
          <StratigraphyTableHeaderCell sx={{ flex: "0 0 90px" }} label={t("depth")} />
          {columns.map(column => (
            <StratigraphyTableHeaderCell key={column.id} label={t(column.label)} sx={column.sx} />
          ))}
        </StratigraphyTableHeader>
        <VerticalZoomPanWrapper>
          <StratigraphyTableContent sx={{ height: `${tableHeight}px` }}>
            {/* Depth column*/}
            <BaseLayerColumn layers={depthLayers} sx={{ flex: "0 0 90px" }} renderLayer={renderDepthColumnLayer} />
            {/* Dynamic columns */}
            {columns.map(column => (
              <BaseLayerColumn
                key={column.id}
                layers={column.layers}
                renderLayer={column.renderLayer}
                onCopyAction={column.onCopyAction}
                sx={column.sx}
              />
            ))}
          </StratigraphyTableContent>
        </VerticalZoomPanWrapper>
      </Stack>
    </Stack>
  );
};
