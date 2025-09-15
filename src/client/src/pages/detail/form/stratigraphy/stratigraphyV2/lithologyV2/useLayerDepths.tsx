import { useMemo } from "react";
import { BaseLayer, FaciesDescription, LithologicalDescription } from "../../../../../../api/stratigraphy.ts";
import { LayerDepth, Lithology } from "../../lithology.ts";

export function useLayerDepths(
  lithologies: Lithology[] | undefined,
  lithologicalDescriptions: LithologicalDescription[] | undefined,
  faciesDescriptions: FaciesDescription[] | undefined,
) {
  const depths = useMemo(() => {
    const layerDepths: LayerDepth[] = [];
    lithologies?.forEach(l => {
      layerDepths.push({ fromDepth: l.fromDepth, toDepth: l.toDepth, lithologyId: l.id });
    });
    layerDepths.sort((a, b) => a.fromDepth - b.fromDepth);

    const canInsertBefore = (description: BaseLayer, layerDepth: LayerDepth) =>
      description.toDepth <= layerDepth.fromDepth;

    const canSkipLayer = (description: BaseLayer, layerDepth: LayerDepth) =>
      description.fromDepth >= layerDepth.toDepth;

    const isContainedInLithology = (description: BaseLayer, layer: LayerDepth) =>
      layer.lithologyId !== 0 && description.fromDepth >= layer.fromDepth && description.toDepth <= layer.toDepth;

    const isExactMatch = (description: BaseLayer, layerDepth: LayerDepth) =>
      description.fromDepth === layerDepth.fromDepth && description.toDepth === layerDepth.toDepth;

    const isWithinLayer = (description: BaseLayer, layerDepth: LayerDepth) =>
      description.fromDepth > layerDepth.fromDepth && description.toDepth < layerDepth.toDepth;

    const isPreviousOverlap = (description: BaseLayer, layerDepth: LayerDepth) =>
      description.fromDepth <= layerDepth.fromDepth &&
      description.toDepth < layerDepth.toDepth &&
      description.toDepth > layerDepth.fromDepth;

    const isNextOverlap = (description: BaseLayer, layerDepth: LayerDepth) =>
      description.fromDepth > layerDepth.fromDepth &&
      description.fromDepth < layerDepth.toDepth &&
      description.toDepth >= layerDepth.toDepth;

    const insertDescription = (description: BaseLayer) => {
      for (let i = 0; i < layerDepths.length; i++) {
        const layerDepth = layerDepths[i];

        if (canInsertBefore(description, layerDepth)) {
          layerDepths.splice(i, 0, { fromDepth: description.fromDepth, toDepth: description.toDepth, lithologyId: 0 });
          return;
        }
        if (canSkipLayer(description, layerDepth)) continue;
        if (isContainedInLithology(description, layerDepth)) return;

        if (layerDepth.lithologyId !== 0) continue;

        if (isExactMatch(description, layerDepth)) return;

        if (isWithinLayer(description, layerDepth)) {
          layerDepths.splice(
            i,
            1,
            { fromDepth: layerDepth.fromDepth, toDepth: description.fromDepth, lithologyId: 0 },
            { fromDepth: description.fromDepth, toDepth: description.toDepth, lithologyId: 0 },
            { fromDepth: description.toDepth, toDepth: layerDepth.toDepth, lithologyId: 0 },
          );
          return;
        }

        if (isPreviousOverlap(description, layerDepth)) {
          layerDepths.splice(
            i,
            1,
            { fromDepth: description.fromDepth, toDepth: description.toDepth, lithologyId: 0 },
            { fromDepth: description.toDepth, toDepth: layerDepth.toDepth, lithologyId: 0 },
          );
          return;
        }

        if (isNextOverlap(description, layerDepth)) {
          layerDepths.splice(
            i,
            1,
            { fromDepth: layerDepth.fromDepth, toDepth: description.fromDepth, lithologyId: 0 },
            { fromDepth: description.fromDepth, toDepth: description.toDepth, lithologyId: 0 },
          );
          return;
        }
      }
      layerDepths.push({ fromDepth: description.fromDepth, toDepth: description.toDepth, lithologyId: 0 });
    };

    // Insert descriptions
    lithologicalDescriptions?.forEach(l => {
      insertDescription(l);
    });
    faciesDescriptions?.forEach(f => {
      insertDescription(f);
    });

    // Fill gaps between layers
    layerDepths.sort((a, b) => a.fromDepth - b.fromDepth);
    const filledLayerDepths: LayerDepth[] = [];
    for (let i = 0; i < layerDepths.length; i++) {
      filledLayerDepths.push(layerDepths[i]);
      if (i < layerDepths.length - 1) {
        const current = layerDepths[i];
        const next = layerDepths[i + 1];
        if (current.toDepth < next.fromDepth) {
          filledLayerDepths.push({ fromDepth: current.toDepth, toDepth: next.fromDepth, lithologyId: 0 });
        }
      }
    }
    return filledLayerDepths;
  }, [lithologies, lithologicalDescriptions, faciesDescriptions]);

  return { depths };
}
