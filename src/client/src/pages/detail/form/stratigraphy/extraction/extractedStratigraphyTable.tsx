import { FC, ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { Box, Typography } from "@mui/material";
import { BaseLayer } from "../../../../../api/stratigraphy.ts";
import { LithologicalDescription } from "../lithologicalDescription.ts";
import {
  StratigraphyTableActionCell,
  StratigraphyTableCell,
  StratigraphyTableColumn,
  StratigraphyTableContent,
  StratigraphyTableDescriptionGap,
  StratigraphyTableHeader,
  StratigraphyTableHeaderCell,
} from "../stratigraphyTableComponents.tsx";
import { defaultRowHeight } from "../stratigraphyUtils.ts";

interface ExtractedStratigraphyTableProps {
  lithologicalDescriptions: BaseLayer[];
}

export const ExtractedStratigraphyTable: FC<ExtractedStratigraphyTableProps> = ({ lithologicalDescriptions }) => {
  const { t } = useTranslation();

  const renderTableCells = (layers: BaseLayer[], buildContent: (layer: BaseLayer) => ReactNode, keyPrefix: string) => {
    if (!layers || layers.length === 0) {
      return (
        <StratigraphyTableDescriptionGap key={`${keyPrefix}-new`} sx={{ height: `${defaultRowHeight}px` }} index={-1} />
      );
    }
    return layers.map((layer, index) =>
      layer.isGap ? (
        <StratigraphyTableDescriptionGap
          index={index}
          key={`${keyPrefix}-${layer.id}-${index}`}
          sx={{
            height: `${defaultRowHeight}px`,
          }}
        />
      ) : (
        <StratigraphyTableActionCell
          index={index}
          key={`${keyPrefix}-${layer.id}-${index}`}
          dataCy={`${keyPrefix}-${layer.fromDepth}-${layer.toDepth}`}
          sx={{
            height: `${defaultRowHeight}px`,
          }}>
          {buildContent(layer)}
        </StratigraphyTableActionCell>
      ),
    );
  };

  return (
    <>
      {!lithologicalDescriptions || lithologicalDescriptions.length === 0 ? (
        <Typography variant="body1">{t("msgNoStratigraphyExtracted")}</Typography>
      ) : (
        <Box sx={{ height: "100%" }}>
          <StratigraphyTableHeader sx={{ width: "100%" }}>
            <StratigraphyTableHeaderCell sx={{ flex: "0 0 90px" }} label={t("depth")} />
            <StratigraphyTableHeaderCell label={t("lithological_description")} />
          </StratigraphyTableHeader>
          <StratigraphyTableContent>
            <StratigraphyTableColumn sx={{ flex: "0 0 90px" }}>
              {lithologicalDescriptions.map((desc, index) => (
                <StratigraphyTableCell key={`depth-${desc.id}-${index}`} sx={{ height: `${defaultRowHeight}px` }}>
                  <Typography>{`${desc.fromDepth} m MD`}</Typography>
                  <Typography>{`${desc.toDepth} m MD`}</Typography>
                </StratigraphyTableCell>
              ))}
            </StratigraphyTableColumn>
            <StratigraphyTableColumn>
              {renderTableCells(
                lithologicalDescriptions,
                layer => (
                  <Typography variant="body1" fontWeight={700}>
                    {(layer as LithologicalDescription).description}
                  </Typography>
                ),
                "extracted_lithologicalDescription",
              )}
            </StratigraphyTableColumn>
          </StratigraphyTableContent>
        </Box>
      )}
    </>
  );
};
