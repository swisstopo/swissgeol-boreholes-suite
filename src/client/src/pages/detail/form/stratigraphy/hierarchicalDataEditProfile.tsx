import { Dispatch, ReactNode, SetStateAction, useCallback, useEffect, useId, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { IconButton, Stack, Tooltip, Typography } from "@mui/material";
import { ChronostratigraphyLayer, Codelist, LithostratigraphyLayer } from "../../../../api/generated";
import { useCodelistSchema } from "../../../../components/codelist.ts";
import LayerCard from "./layerCard.jsx";
import LayerGap from "./layerGap.jsx";
import { NavState } from "./navigation/navState.ts";

export type HierarchicalLayer = ChronostratigraphyLayer | LithostratigraphyLayer;

// Shape posted when creating a new layer. The server fills in the rest (id, codelist ref, etc.).
export interface NewLayerInput {
  stratigraphyId: number;
  fromDepth: number;
  toDepth: number;
}

interface HeaderColumn {
  title: string;
  isVisible: boolean;
}

interface CodelistOption {
  label: string;
  id: number;
  color: string | undefined;
  path: number[];
}

interface UseHierarchicalDataEditProfileArgs {
  layerData: HierarchicalLayer[] | undefined;
  addLayer: (layer: NewLayerInput) => void;
  deleteLayer: (id: number) => void;
  updateLayer: (layer: HierarchicalLayer) => void;
  headerLabels: string[];
  codelistSchemaName: string;
  dataProperty: string;
  selectedStratigraphyID: number;
  navState: NavState;
  setNavState: Dispatch<SetStateAction<NavState>>;
}

export interface HierarchicalDataEditProfileParts {
  // The visibility-toggleable header cells for the hierarchy levels (eon, era, …) ready to drop
  // into a unified StratigraphyTableHeader alongside other column cells (e.g. depth).
  headerCells: ReactNode;
  // The depth-positioned LayerCard / LayerGap stack to mount inside a NavigationChild body.
  layerStack: ReactNode;
  // Append a new layer below the deepest existing one and pan the lens to it.
  handleAddLayer: () => void;
  // Sorted, deduplicated list of layer-boundary depths (fromDepth + toDepth across all layers).
  depths: ReadonlyArray<number>;
}

const iconSlotSx = {
  flex: "0 0 36px",
  alignItems: "center",
  justifyContent: "center",
};

const visibleCellSx = {
  flex: 1,
  minWidth: 0,
  flexDirection: "row" as const,
  alignItems: "center",
  justifyContent: "center",
  paddingY: 1,
  paddingX: 1,
  gap: 0.5,
};

const iconButtonSx = { padding: 0.25 };

const codelistLocale = (codelist: Codelist, language: string): string => {
  const lang = language as keyof Pick<Codelist, "en" | "de" | "fr" | "it" | "ro">;
  return String(codelist[lang] ?? codelist.en ?? "");
};

// Hook for editing hierarchical layer data. Returns the visibility-toggleable header cells, the
// depth-positioned layer stack, and an add-layer handler so callers can compose them into the
// CSS-grid layout shared with the lithology panel.
export function useHierarchicalDataEditProfile({
  // array of layers
  layerData: layers,
  // function that adds a layer
  addLayer,
  // function that deletes a layer
  deleteLayer,
  // function that updates a layer
  updateLayer,
  // array of translation keys
  headerLabels,
  // string that specifies the codelist schema to use
  codelistSchemaName,
  // string that specifies the property of the layer object that contains the data
  dataProperty,
  selectedStratigraphyID,
  navState,
  setNavState,
}: UseHierarchicalDataEditProfileArgs): HierarchicalDataEditProfileParts {
  const { t, i18n } = useTranslation();
  const id = useId();
  const [options, setOptions] = useState<CodelistOption[][] | null>(null);
  const [header, setHeader] = useState<HeaderColumn[]>(headerLabels.map(h => ({ title: h, isVisible: true })));

  const { data: schemaData } = useCodelistSchema(codelistSchemaName);

  // create options array from codelist schema
  // The options are the same for all layers
  useEffect(() => {
    if (!schemaData) return;
    const sorted = [...schemaData].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
    const grouped = sorted.reduce<CodelistOption[][]>((accu, d) => {
      // Path is delivered by the API as an ltree string ("1.2.3"), but the generated TS type
      // represents it as a record. Treat it as a string at runtime to match the actual payload.
      const pathString = (d.path as unknown as string | undefined) ?? "";
      const path = pathString.split(".").map(p => +p);
      const level = path.length - 1;
      const conf = JSON.parse(d.conf ?? "null") as { color?: string } | null;
      accu[level] ??= [];
      accu[level].push({
        label: codelistLocale(d, i18n.language),
        id: d.id,
        color: conf?.color,
        path,
      });
      return accu;
    }, []);
    setOptions(grouped);
  }, [i18n.language, schemaData]);

  useEffect(() => {
    // Map to the narrow shape setContentHeightFromLayers expects (undefined → null) so the API
    // signatures line up; the runtime behaviour stays identical.
    const depthLayers = (layers ?? []).map(l => ({ toDepth: l.toDepth ?? null }));
    setNavState(prev => prev.setContentHeightFromLayers(id, depthLayers));
  }, [id, layers, setNavState]);

  const pixelPerMeter = navState.pixelPerMeter;
  const layerStack = useMemo<ReactNode>(() => {
    const stack: ReactNode[] = [];
    if (!layers) return stack;
    layers.forEach((layer, index) => {
      const previousLayerToDepth = index === 0 ? 0 : (layers[index - 1]?.toDepth ?? 0);
      const nextLayerFromDepth = index === layers.length - 1 ? Number.MAX_VALUE : (layers[index + 1]?.fromDepth ?? 0);

      const layerFromDepth = layer.fromDepth ?? 0;
      const layerToDepth = layer.toDepth ?? 0;

      if (layerFromDepth > previousLayerToDepth) {
        stack.push(
          <LayerGap
            addLayer={addLayer}
            updateLayer={updateLayer}
            key={-index}
            previousLayer={layers[index - 1]}
            nextLayer={layers[index]}
            height={(layerFromDepth - previousLayerToDepth) * pixelPerMeter}
          />,
        );
      }
      stack.push(
        <LayerCard
          updateLayer={updateLayer}
          deleteLayer={deleteLayer}
          dataProperty={dataProperty}
          options={options}
          key={layer.id}
          layer={layer}
          minFromDepth={previousLayerToDepth}
          maxToDepth={nextLayerFromDepth}
          header={header}
          height={(layerToDepth - layerFromDepth) * pixelPerMeter}
        />,
      );
    });
    return stack;
  }, [layers, pixelPerMeter, addLayer, updateLayer, deleteLayer, dataProperty, options, header]);

  const depths = useMemo<ReadonlyArray<number>>(() => {
    if (!layers) return [];
    const set = new Set<number>();
    for (const l of layers) {
      if (l.fromDepth != null) set.add(l.fromDepth);
      if (l.toDepth != null) set.add(l.toDepth);
    }
    return [...set].sort((a, b) => a - b);
  }, [layers]);

  const lensSize = navState.lensSize;
  const toggleHeaderVisibility = useCallback((targetIndex: number) => {
    setHeader(prev => prev.map((h, i) => (targetIndex === i ? { ...h, isVisible: !h.isVisible } : h)));
  }, []);

  const headerCells = useMemo<ReactNode>(
    () =>
      header.map((h, index) =>
        h.isVisible ? (
          <Stack key={h.title} sx={visibleCellSx}>
            <Typography variant="body2" fontWeight={700} noWrap>
              {t(h.title)}
            </Typography>
            <IconButton
              size="small"
              onClick={() => toggleHeaderVisibility(index)}
              aria-label={t(h.title)}
              data-cy={`column-visibility-${index}`}
              sx={iconButtonSx}>
              <Visibility fontSize="small" />
            </IconButton>
          </Stack>
        ) : (
          <Stack key={h.title} sx={iconSlotSx}>
            <Tooltip title={t(h.title)}>
              <IconButton
                size="small"
                onClick={() => toggleHeaderVisibility(index)}
                aria-label={t(h.title)}
                data-cy={`column-visibility-${index}`}
                sx={iconButtonSx}>
                <VisibilityOff fontSize="small" />
              </IconButton>
            </Tooltip>
          </Stack>
        ),
      ),
    [t, header, toggleHeaderVisibility],
  );

  const handleAddLayer = useCallback(() => {
    const newFromDepth = layers?.at(-1)?.toDepth ?? 0;
    // new layer is created with a depth of 10m
    const newToDepth = newFromDepth + 10;
    addLayer({
      stratigraphyId: selectedStratigraphyID,
      fromDepth: newFromDepth,
      toDepth: newToDepth,
    });
    // adjust navigation state to make new layer visible
    setNavState(prev => prev.setLensStart(Math.max(0, newToDepth - lensSize)));
  }, [addLayer, layers, lensSize, selectedStratigraphyID, setNavState]);

  return { headerCells, layerStack, handleAddLayer, depths };
}
