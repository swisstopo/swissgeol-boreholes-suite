import { FC, ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { Box, Typography } from "@mui/material";
import { BaseLayer, LithologicalDescription } from "../../../../../api/stratigraphy.ts";
import {
  StratigraphyTableActionCell,
  StratigraphyTableCell,
  StratigraphyTableColumn,
  StratigraphyTableContent,
  StratigraphyTableGap,
  StratigraphyTableHeader,
  StratigraphyTableHeaderCell,
} from "../stratigraphyV2/stratigraphyTableComponents.tsx";

interface ExtractedStratigraphyTableProps {
  lithologicalDescriptions: BaseLayer[];
}

export const ExtractedStratigraphyTable: FC<ExtractedStratigraphyTableProps> = ({ lithologicalDescriptions }) => {
  const { t } = useTranslation();
  const defaultRowHeight = 240;

  const renderTableCells = (layers: BaseLayer[], buildContent: (layer: BaseLayer) => ReactNode, keyPrefix: string) => {
    if (!layers || layers.length === 0) {
      return (
        <StratigraphyTableGap
          key={`${keyPrefix}-new`}
          sx={{ height: `${defaultRowHeight}px` }}
          layer={{ id: 0, stratigraphyId: 0, isGap: true, fromDepth: -1, toDepth: -1 }}
        />
      );
    }
    return layers.map(layer =>
      layer.isGap ? (
        <StratigraphyTableGap
          key={`${keyPrefix}-${layer.id}`}
          sx={{
            height: `${defaultRowHeight}px`,
          }}
          layer={layer}
        />
      ) : (
        <StratigraphyTableActionCell
          key={`${keyPrefix}-${layer.id}`}
          sx={{
            height: `${defaultRowHeight}px`,
          }}
          layer={layer}
          onHoverClick={() => console.log("copy layer content", layer)}>
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
              {lithologicalDescriptions.map(desc => (
                <StratigraphyTableCell key={`depth-${desc.id}`} sx={{ height: `${defaultRowHeight}px` }}>
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
                "lithologicalDescription",
              )}
            </StratigraphyTableColumn>
          </StratigraphyTableContent>
        </Box>
      )}
    </>
  );
};
