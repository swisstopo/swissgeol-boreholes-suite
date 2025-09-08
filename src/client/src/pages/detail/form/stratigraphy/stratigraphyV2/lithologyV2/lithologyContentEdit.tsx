import { FC, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { CircularProgress, Stack, Typography } from "@mui/material";
import {
  BaseLayer,
  FaciesDescription,
  LithologicalDescription,
  useFaciesDescription,
  useLithoDescription,
} from "../../../../../../api/stratigraphy.ts";
import { FullPageCentered } from "../../../../../../components/styledComponents.ts";
import { Lithology, useLithologies } from "../../lithology.ts";
import {
  AddRowButton,
  StratigraphyTableActionCell,
  StratigraphyTableCell,
  StratigraphyTableColumn,
  StratigraphyTableContent,
  StratigraphyTableGap,
  StratigraphyTableHeader,
  StratigraphyTableHeaderCell,
} from "../stratigraphyTableComponents.tsx";
import { useCompletedLayers } from "./useCompletedLayers.tsx";
import { useLithologyLabels } from "./useLithologyLabels.tsx";

interface LithologyContentEditProps {
  stratigraphyId: number;
}

export const LithologyContentEdit: FC<LithologyContentEditProps> = ({ stratigraphyId }) => {
  const { t } = useTranslation();
  const { data: lithologies, isLoading } = useLithologies(stratigraphyId);
  const { data: lithologicalDescriptions } = useLithoDescription(stratigraphyId);
  const { data: faciesDescriptions } = useFaciesDescription(stratigraphyId);
  const { completedLayers: completedLithologies } = useCompletedLayers(lithologies);
  const { completedLayers: completedLithologicalDescriptions } = useCompletedLayers(lithologicalDescriptions);
  const { completedLayers: completedFaciesDescriptions } = useCompletedLayers(faciesDescriptions);
  const { buildLithologyLabels } = useLithologyLabels();

  const defaultRowHeight = 240;

  const computeCellHeight = useCallback(
    (fromDepth: number, toDepth: number) => {
      const startIndex = completedLithologies.findIndex(l => l.fromDepth === fromDepth);
      const endIndex = completedLithologies.findIndex(l => l.toDepth === toDepth);
      if (startIndex === -1 || endIndex === -1) return defaultRowHeight;
      return (endIndex - startIndex + 1) * defaultRowHeight;
    },
    [completedLithologies],
  );

  const handleEditLithology = useCallback((layer: BaseLayer) => {
    const lithology = layer as unknown as Lithology;
    console.log("edit lithology", lithology.id);
  }, []);

  const handleDeleteLithology = useCallback((layer: BaseLayer) => {
    const lithology = layer as unknown as Lithology;
    console.log("delete lithology", lithology.id);
  }, []);

  const handleEditLithologicalDescription = useCallback((layer: BaseLayer) => {
    const lithologicalDescription = layer as unknown as LithologicalDescription;
    console.log("edit lithologicalDescription", lithologicalDescription.id);
  }, []);

  const handleDeleteLithologicalDescription = useCallback((layer: BaseLayer) => {
    const lithologicalDescription = layer as unknown as LithologicalDescription;
    console.log("delete lithologicalDescription", lithologicalDescription.id);
  }, []);

  const handleEditFaciesDescription = useCallback((layer: BaseLayer) => {
    const faciesDescription = layer as unknown as FaciesDescription;
    console.log("edit faciesDescription", faciesDescription.id);
  }, []);

  const handleDeleteFaciesDescription = useCallback((layer: BaseLayer) => {
    const faciesDescription = layer as unknown as FaciesDescription;
    console.log("delete faciesDescription", faciesDescription.id);
  }, []);

  if (isLoading) {
    return (
      <FullPageCentered>
        <CircularProgress />
      </FullPageCentered>
    );
  }

  return (
    <Stack gap={1.5}>
      <Stack>
        <StratigraphyTableHeader>
          <StratigraphyTableHeaderCell sx={{ flex: "0 0 90px" }} label={t("depth")} />
          <StratigraphyTableHeaderCell label={t("lithology")} />
          <StratigraphyTableHeaderCell label={t("lithological_description")} />
          <StratigraphyTableHeaderCell label={t("facies_description")} />
        </StratigraphyTableHeader>
        <StratigraphyTableContent>
          <StratigraphyTableColumn sx={{ flex: "0 0 90px" }}>
            {!completedLithologies || completedLithologies.length === 0 ? (
              <StratigraphyTableCell>empty</StratigraphyTableCell>
            ) : (
              completedLithologies.map(lithology => (
                <StratigraphyTableCell key={`depth-${lithology.id}`} sx={{ height: `${defaultRowHeight}px` }}>
                  <Typography>{`${lithology.fromDepth} m MD`}</Typography>
                  <Typography>{`${lithology.toDepth} m MD`}</Typography>
                </StratigraphyTableCell>
              ))
            )}
          </StratigraphyTableColumn>
          <StratigraphyTableColumn>
            {completedLithologies.length === 0 ? (
              <StratigraphyTableGap
                key={`lithology-new`}
                sx={{ height: `${defaultRowHeight}px` }}
                layer={{ id: 0, stratigraphyId: stratigraphyId, isGap: true, fromDepth: -1, toDepth: -1 }}
                onClick={handleEditLithology}
              />
            ) : (
              completedLithologies.map(lithology =>
                lithology.isGap ? (
                  <StratigraphyTableGap
                    key={`lithology-${lithology.id}`}
                    sx={{ height: `${defaultRowHeight}px` }}
                    layer={lithology}
                    onClick={handleEditLithology}
                  />
                ) : (
                  <StratigraphyTableActionCell
                    key={`lithology-${lithology.id}`}
                    sx={{ height: `${defaultRowHeight}px` }}
                    layer={lithology}
                    onClick={handleEditLithology}
                    onHoverClick={handleDeleteLithology}>
                    {buildLithologyLabels(lithology as Lithology)}
                  </StratigraphyTableActionCell>
                ),
              )
            )}
          </StratigraphyTableColumn>
          <StratigraphyTableColumn>
            {completedLithologicalDescriptions.length === 0 ? (
              <StratigraphyTableGap
                key={`lithologicalDescription-new`}
                sx={{
                  height: `${defaultRowHeight}px`,
                }}
                layer={{ id: 0, stratigraphyId: stratigraphyId, isGap: true, fromDepth: -1, toDepth: -1 }}
                onClick={handleEditLithologicalDescription}
              />
            ) : (
              completedLithologicalDescriptions.map(description =>
                description.isGap ? (
                  <StratigraphyTableGap
                    key={`lithologicalDescription-${description.id}`}
                    sx={{
                      height: `${computeCellHeight(description.fromDepth, description.toDepth)}px`,
                    }}
                    layer={description}
                    onClick={handleEditLithologicalDescription}
                  />
                ) : (
                  <StratigraphyTableActionCell
                    key={`lithologicalDescription-${description.id}`}
                    sx={{
                      height: `${computeCellHeight(description.fromDepth, description.toDepth)}px`,
                    }}
                    layer={description}
                    onClick={handleEditLithologicalDescription}
                    onHoverClick={handleDeleteLithologicalDescription}>
                    <Typography variant="body1" fontWeight={700}>
                      {(description as LithologicalDescription).description}
                    </Typography>
                  </StratigraphyTableActionCell>
                ),
              )
            )}
          </StratigraphyTableColumn>
          <StratigraphyTableColumn>
            {completedFaciesDescriptions.length === 0 ? (
              <StratigraphyTableGap
                key={`faciesDescription-new}`}
                sx={{
                  height: `${defaultRowHeight}px`,
                }}
                layer={{ id: 0, stratigraphyId: stratigraphyId, isGap: true, fromDepth: -1, toDepth: -1 }}
                onClick={handleEditFaciesDescription}
              />
            ) : (
              completedFaciesDescriptions.map(description =>
                description.isGap ? (
                  <StratigraphyTableGap
                    key={`faciesDescription-${description.id}`}
                    sx={{
                      height: `${computeCellHeight(description.fromDepth, description.toDepth)}px`,
                    }}
                    layer={description}
                    onClick={handleEditFaciesDescription}
                  />
                ) : (
                  <StratigraphyTableActionCell
                    key={`faciesDescription-${description.id}`}
                    sx={{
                      height: `${computeCellHeight(description.fromDepth, description.toDepth)}px`,
                    }}
                    layer={description}
                    onClick={handleEditFaciesDescription}
                    onHoverClick={handleDeleteFaciesDescription}>
                    <Typography variant="body1" fontWeight={700}>
                      {(description as FaciesDescription).description}
                    </Typography>
                  </StratigraphyTableActionCell>
                ),
              )
            )}
          </StratigraphyTableColumn>
        </StratigraphyTableContent>
      </Stack>
      <AddRowButton />
    </Stack>
  );
};
