import { useCallback, useMemo } from "react";
import { LithostratigraphyLayer } from "../../../../../../api/generated";
import { useLithostratigraphies } from "../../stratigraphy.ts";
import { getLithostratigraphyColor } from "../scaledLayerColumn/getLithostratigraphyColor.ts";

type LithostratigraphyWithDepths = LithostratigraphyLayer & { fromDepth: number; toDepth: number };

// Fetches lithostratigraphies for a given stratigraphy, filters out layers without
// depth values, and provides a color accessor. Designed for LensColumn consumers that
// display lithostratigraphy colors.
export const useLithostratigraphyLensLayers = (stratigraphyId: number) => {
  const { data: lithostratigraphies = [] } = useLithostratigraphies(stratigraphyId);

  const validLayers = useMemo<ReadonlyArray<LithostratigraphyWithDepths>>(
    () =>
      lithostratigraphies.filter((l): l is LithostratigraphyWithDepths => l.fromDepth !== null && l.toDepth !== null),
    [lithostratigraphies],
  );

  // Memoised id → color map: parsing the Codelist `conf` JSON once per render of the panel
  // (not once per layer × cell).
  const colorByLithostratigraphyId = useMemo(() => {
    const map = new Map<number, string | undefined>();
    for (const lithostratigraphy of lithostratigraphies)
      map.set(lithostratigraphy.id, getLithostratigraphyColor(lithostratigraphy));
    return map;
  }, [lithostratigraphies]);
  const getColor = useCallback(
    (layer: { id: number }) => colorByLithostratigraphyId.get(layer.id),
    [colorByLithostratigraphyId],
  );
  return { validLayers, getColor } as const;
};
