import { FC, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { CircularProgress, Stack, Typography } from "@mui/material";
import { Trash2 } from "lucide-react";
import {
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
              <StratigraphyTableGap key={`lithology-new`} canEdit={true} sx={{ height: `${defaultRowHeight}px` }} />
            ) : (
              completedLithologies.map(lithology =>
                lithology.isGap ? (
                  <StratigraphyTableGap
                    key={`lithology-${lithology.id}`}
                    canEdit={true}
                    sx={{ height: `${defaultRowHeight}px` }}
                  />
                ) : (
                  <StratigraphyTableActionCell
                    key={`lithology-${lithology.id}`}
                    sx={{ height: `${defaultRowHeight}px` }}
                    onClick={() => {
                      console.log("start editing lithology", lithology.id);
                    }}
                    topLabel={`${lithology.fromDepth} m MD`}
                    bottomLabel={`${lithology.toDepth} m MD`}
                    action={{
                      icon: <Trash2 />,
                      label: "Delete",
                      onClick: () => {
                        console.log("clicked delete lithology", lithology.id);
                      },
                    }}>
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
                canEdit={true}
                sx={{
                  height: `${defaultRowHeight}px`,
                }}
              />
            ) : (
              completedLithologicalDescriptions.map(description =>
                description.isGap ? (
                  <StratigraphyTableGap
                    key={`lithologicalDescription-${description.id}`}
                    canEdit={true}
                    sx={{
                      height: `${computeCellHeight(description.fromDepth, description.toDepth)}px`,
                    }}
                  />
                ) : (
                  <StratigraphyTableActionCell
                    key={`lithologicalDescription-${description.id}`}
                    sx={{
                      height: `${computeCellHeight(description.fromDepth, description.toDepth)}px`,
                    }}
                    onClick={() => {
                      console.log("start editing lithologicalDescription", description.id);
                    }}>
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
                canEdit={true}
                sx={{
                  height: `${defaultRowHeight}px`,
                }}
              />
            ) : (
              completedFaciesDescriptions.map(description =>
                description.isGap ? (
                  <StratigraphyTableGap
                    key={`faciesDescription-${description.id}`}
                    canEdit={true}
                    sx={{
                      height: `${computeCellHeight(description.fromDepth, description.toDepth)}px`,
                    }}
                  />
                ) : (
                  <StratigraphyTableActionCell
                    key={`faciesDescription-${description.id}`}
                    sx={{
                      height: `${computeCellHeight(description.fromDepth, description.toDepth)}px`,
                    }}
                    onClick={() => {
                      console.log("start editing faciesDescription", description.id);
                    }}>
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
