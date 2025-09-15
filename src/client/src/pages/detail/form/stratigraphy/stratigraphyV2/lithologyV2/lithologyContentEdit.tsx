import { FC, ReactNode, useCallback, useContext } from "react";
import { useTranslation } from "react-i18next";
import { Stack, Typography } from "@mui/material";
import { Trash2 } from "lucide-react";
import {
  BaseLayer,
  FaciesDescription,
  LithologicalDescription,
  useFaciesDescriptionMutations,
  useLithologicalDescriptionMutations,
} from "../../../../../../api/stratigraphy.ts";
import { PromptContext } from "../../../../../../components/prompt/promptContext.tsx";
import { Lithology, useLithologyMutations } from "../../lithology.ts";
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
import { useLayerDepths } from "./useLayerDepths.tsx";
import { useLithologyLabels } from "./useLithologyLabels.tsx";

interface LithologyContentEditProps {
  stratigraphyId: number;
  lithologies: Lithology[];
  lithologicalDescriptions: LithologicalDescription[];
  faciesDescriptions: FaciesDescription[];
}

export const LithologyContentEdit: FC<LithologyContentEditProps> = ({
  stratigraphyId,
  lithologies,
  lithologicalDescriptions,
  faciesDescriptions,
}) => {
  const { t } = useTranslation();
  const { showPrompt } = useContext(PromptContext);
  const {
    delete: { mutateAsync: deleteLithology },
  } = useLithologyMutations();
  const {
    delete: { mutateAsync: deleteLithologicalDescription },
  } = useLithologicalDescriptionMutations();
  const {
    delete: { mutateAsync: deleteFaciesDescription },
  } = useFaciesDescriptionMutations();
  const { buildLithologyLabels } = useLithologyLabels();
  const { depths } = useLayerDepths(lithologies, lithologicalDescriptions, faciesDescriptions);

  const { completedLayers: completedLithologies } = useCompletedLayers(lithologies, depths);
  const { completedLayers: completedLithologicalDescriptions } = useCompletedLayers(lithologicalDescriptions, depths);
  const { completedLayers: completedFaciesDescriptions } = useCompletedLayers(faciesDescriptions, depths);

  const defaultRowHeight = 240;

  const computeCellHeight = useCallback(
    (fromDepth: number, toDepth: number) => {
      const startIndex = depths.findIndex(l => l.fromDepth === fromDepth);
      const endIndex = depths.findIndex(l => l.toDepth === toDepth);
      if (startIndex === -1 || endIndex === -1) return defaultRowHeight;
      return (endIndex - startIndex + 1) * defaultRowHeight;
    },
    [depths],
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

  const renderGapCell = (
    layer: BaseLayer,
    keyPrefix: string,
    defaultRowHeight: number,
    computeCellHeight: ((fromDepth: number, toDepth: number) => number) | null,
    onEdit: (layer: BaseLayer) => void,
  ) => (
    <StratigraphyTableGap
      key={`${keyPrefix}-${layer.id}`}
      sx={{
        height: `${computeCellHeight ? computeCellHeight(layer.fromDepth, layer.toDepth) : defaultRowHeight}px`,
      }}
      layer={layer}
      onClick={onEdit}
    />
  );

  const renderActionCell = (
    layer: BaseLayer,
    keyPrefix: string,
    defaultRowHeight: number,
    computeCellHeight: ((fromDepth: number, toDepth: number) => number) | null,
    onEdit: (layer: BaseLayer) => void,
    onDelete: (layer: BaseLayer) => void,
    buildContent: (layer: BaseLayer) => ReactNode,
  ) => (
    <StratigraphyTableActionCell
      key={`${keyPrefix}-${layer.id}`}
      sx={{
        height: `${computeCellHeight ? computeCellHeight(layer.fromDepth, layer.toDepth) : defaultRowHeight}px`,
      }}
      layer={layer}
      onClick={onEdit}
      onHoverClick={layer => {
        showPrompt("deleteMessage", [
          { label: "cancel" },
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
      layer.isGap
        ? renderGapCell(layer, keyPrefix, defaultRowHeight, computeCellHeight, onEdit)
        : renderActionCell(layer, keyPrefix, defaultRowHeight, computeCellHeight, onEdit, onDelete, buildContent),
    );
  };

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
            {!depths || depths.length === 0 ? (
              <StratigraphyTableCell>empty</StratigraphyTableCell>
            ) : (
              depths.map((depth, index) => (
                <StratigraphyTableCell key={`depth-${index}`} sx={{ height: `${defaultRowHeight}px` }}>
                  <Typography>{`${depth.fromDepth} m MD`}</Typography>
                  <Typography>{`${depth.toDepth} m MD`}</Typography>
                </StratigraphyTableCell>
              ))
            )}
          </StratigraphyTableColumn>
          <StratigraphyTableColumn>
            {renderTableCells(
              completedLithologies,
              defaultRowHeight,
              computeCellHeight,
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
