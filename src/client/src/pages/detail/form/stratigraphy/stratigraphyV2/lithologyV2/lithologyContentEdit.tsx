import { FC, ReactNode, useCallback, useContext } from "react";
import { useTranslation } from "react-i18next";
import { CircularProgress, Stack, Typography } from "@mui/material";
import { Trash2 } from "lucide-react";
import {
  BaseLayer,
  FaciesDescription,
  LithologicalDescription,
  useFaciesDescription,
  useFaciesDescriptionMutations,
  useLithoDescription,
  useLithologicalDescriptionMutations,
} from "../../../../../../api/stratigraphy.ts";
import { PromptContext } from "../../../../../../components/prompt/promptContext.tsx";
import { FullPageCentered } from "../../../../../../components/styledComponents.ts";
import { Lithology, useLithologies, useLithologyMutations } from "../../lithology.ts";
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
  const { showPrompt } = useContext(PromptContext);
  const { data: lithologies, isLoading } = useLithologies(stratigraphyId);
  const {
    delete: { mutateAsync: deleteLithology },
  } = useLithologyMutations();
  const { data: lithologicalDescriptions } = useLithoDescription(stratigraphyId);
  const {
    delete: { mutateAsync: deleteLithologicalDescription },
  } = useLithologicalDescriptionMutations();
  const { data: faciesDescriptions } = useFaciesDescription(stratigraphyId);
  const {
    delete: { mutateAsync: deleteFaciesDescription },
  } = useFaciesDescriptionMutations();
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

  const handleDeleteLithology = useCallback(
    (layer: BaseLayer) => {
      const lithology = layer as unknown as Lithology;
      deleteLithology(lithology);
    },
    [deleteLithology],
  );

  const handleEditLithologicalDescription = useCallback((layer: BaseLayer) => {
    const lithologicalDescription = layer as unknown as LithologicalDescription;
    console.log("edit lithologicalDescription", lithologicalDescription.id);
  }, []);

  const handleDeleteLithologicalDescription = useCallback(
    (layer: BaseLayer) => {
      const lithologicalDescription = layer as unknown as LithologicalDescription;
      deleteLithologicalDescription(lithologicalDescription);
    },
    [deleteLithologicalDescription],
  );

  const handleEditFaciesDescription = useCallback((layer: BaseLayer) => {
    const faciesDescription = layer as unknown as FaciesDescription;
    console.log("edit faciesDescription", faciesDescription.id);
  }, []);

  const handleDeleteFaciesDescription = useCallback(
    (layer: BaseLayer) => {
      const faciesDescription = layer as unknown as FaciesDescription;
      deleteFaciesDescription(faciesDescription);
    },
    [deleteFaciesDescription],
  );

  const renderTableCells = (
    layers: BaseLayer[],
    defaultRowHeight: number,
    computeCellHeight: ((fromDepth: number, toDepth: number) => number) | null,
    onEdit: (layer: BaseLayer) => void,
    onDelete: (layer: BaseLayer) => void,
    buildContent: (layer: BaseLayer) => ReactNode,
    keyPrefix: string,
  ) => {
    if (!layers || layers.length === 0) {
      return (
        <StratigraphyTableGap
          key={`${keyPrefix}-new`}
          sx={{ height: `${defaultRowHeight}px` }}
          layer={{ id: 0, stratigraphyId: stratigraphyId, isGap: true, fromDepth: -1, toDepth: -1 }}
          onClick={onEdit}
        />
      );
    }
    return layers.map(layer =>
      layer.isGap ? (
        <StratigraphyTableGap
          key={`${keyPrefix}-${layer.id}`}
          sx={{
            height: `${computeCellHeight ? computeCellHeight(layer.fromDepth, layer.toDepth) : defaultRowHeight}px`,
          }}
          layer={layer}
          onClick={onEdit}
        />
      ) : (
        <StratigraphyTableActionCell
          key={`${keyPrefix}-${layer.id}`}
          sx={{
            height: `${computeCellHeight ? computeCellHeight(layer.fromDepth, layer.toDepth) : defaultRowHeight}px`,
          }}
          layer={layer}
          onClick={onEdit}
          onHoverClick={layer => {
            showPrompt("deleteMessage", [
              {
                label: "cancel",
              },
              {
                label: "delete",
                icon: <Trash2 />,
                variant: "contained",
                action: () => onDelete(layer),
              },
            ]);
          }}>
          {buildContent(layer)}
        </StratigraphyTableActionCell>
      ),
    );
  };

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
            {renderTableCells(
              completedLithologies,
              defaultRowHeight,
              null,
              handleEditLithology,
              handleDeleteLithology,
              layer => buildLithologyLabels(layer as Lithology),
              "lithology",
            )}
          </StratigraphyTableColumn>
          <StratigraphyTableColumn>
            {renderTableCells(
              completedLithologicalDescriptions,
              defaultRowHeight,
              computeCellHeight,
              handleEditLithologicalDescription,
              handleDeleteLithologicalDescription,
              layer => (
                <Typography variant="body1" fontWeight={700}>
                  {(layer as LithologicalDescription).description}
                </Typography>
              ),
              "lithologicalDescription",
            )}
          </StratigraphyTableColumn>
          <StratigraphyTableColumn>
            {renderTableCells(
              completedFaciesDescriptions,
              defaultRowHeight,
              computeCellHeight,
              handleEditFaciesDescription,
              handleDeleteFaciesDescription,
              layer => (
                <Typography variant="body1" fontWeight={700}>
                  {(layer as FaciesDescription).description}
                </Typography>
              ),
              "faciesDescription",
            )}
          </StratigraphyTableColumn>
        </StratigraphyTableContent>
      </Stack>
      <AddRowButton />
    </Stack>
  );
};
