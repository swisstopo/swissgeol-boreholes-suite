import { useMemo } from "react";
import { BaseLayer, FaciesDescription, LithologicalDescription } from "../../../../../../api/stratigraphy.ts";
import { LayerDepth, Lithology } from "../../lithology.ts";

const handleInsertBefore = (description: BaseLayer, layerDepth: LayerDepth, i: number, layerDepths: LayerDepth[]) => {
  if (description.toDepth <= layerDepth.fromDepth) {
    layerDepths.splice(i, 0, { fromDepth: description.fromDepth, toDepth: description.toDepth, lithologyId: 0 });
    return true;
  }
  return false;
};

const handleSkipLayer = (description: BaseLayer, layerDepth: LayerDepth) => description.fromDepth >= layerDepth.toDepth;

const handleContained = (description: BaseLayer, layerDepth: LayerDepth) =>
  layerDepth.lithologyId !== 0 &&
  description.fromDepth >= layerDepth.fromDepth &&
  description.toDepth <= layerDepth.toDepth;

const handleExactMatch = (description: BaseLayer, layerDepth: LayerDepth) =>
  layerDepth.lithologyId === 0 &&
  description.fromDepth === layerDepth.fromDepth &&
  description.toDepth === layerDepth.toDepth;

const handleWithinLayer = (description: BaseLayer, layerDepth: LayerDepth, i: number, layerDepths: LayerDepth[]) => {
  if (
    layerDepth.lithologyId === 0 &&
    description.fromDepth > layerDepth.fromDepth &&
    description.toDepth < layerDepth.toDepth
  ) {
    layerDepths.splice(
      i,
      1,
      { fromDepth: layerDepth.fromDepth, toDepth: description.fromDepth, lithologyId: 0 },
      { fromDepth: description.fromDepth, toDepth: description.toDepth, lithologyId: 0 },
      { fromDepth: description.toDepth, toDepth: layerDepth.toDepth, lithologyId: 0 },
    );
    return true;
  }
  return false;
};

const handlePreviousOverlap = (
  description: BaseLayer,
  layerDepth: LayerDepth,
  i: number,
  layerDepths: LayerDepth[],
) => {
  if (
    layerDepth.lithologyId === 0 &&
    description.fromDepth <= layerDepth.fromDepth &&
    description.toDepth < layerDepth.toDepth &&
    description.toDepth > layerDepth.fromDepth
  ) {
    layerDepths.splice(
      i,
      1,
      { fromDepth: description.fromDepth, toDepth: description.toDepth, lithologyId: 0 },
      { fromDepth: description.toDepth, toDepth: layerDepth.toDepth, lithologyId: 0 },
    );
    return true;
  }
  return false;
};

const handleNextOverlap = (description: BaseLayer, layerDepth: LayerDepth, i: number, layerDepths: LayerDepth[]) => {
  if (
    layerDepth.lithologyId === 0 &&
    description.fromDepth > layerDepth.fromDepth &&
    description.fromDepth < layerDepth.toDepth &&
    description.toDepth >= layerDepth.toDepth
  ) {
    layerDepths.splice(
      i,
      1,
      { fromDepth: layerDepth.fromDepth, toDepth: description.fromDepth, lithologyId: 0 },
      { fromDepth: description.fromDepth, toDepth: description.toDepth, lithologyId: 0 },
    );
    return true;
  }
  return false;
};

export function useLayerDepths(
  lithologies: Lithology[],
  lithologicalDescriptions: LithologicalDescription[],
  faciesDescriptions: FaciesDescription[],
) {
  const depths = useMemo(() => {
    const layerDepths: LayerDepth[] = [];
    lithologies.forEach(l => {
      layerDepths.push({ fromDepth: l.fromDepth, toDepth: l.toDepth, lithologyId: l.id });
    });
    layerDepths.sort((a, b) => a.fromDepth - b.fromDepth);

    const insertDescription = (description: BaseLayer) => {
      for (let i = 0; i < layerDepths.length; i++) {
        const layerDepth = layerDepths[i];
        if (handleInsertBefore(description, layerDepth, i, layerDepths)) return;
        if (handleSkipLayer(description, layerDepth)) continue;
        if (handleContained(description, layerDepth)) return;
        if (handleExactMatch(description, layerDepth)) return;
        if (handleWithinLayer(description, layerDepth, i, layerDepths)) return;
        if (handlePreviousOverlap(description, layerDepth, i, layerDepths)) return;
        if (handleNextOverlap(description, layerDepth, i, layerDepths)) return;
      }
      layerDepths.push({ fromDepth: description.fromDepth, toDepth: description.toDepth, lithologyId: 0 });
    };

    lithologicalDescriptions.forEach(l => {
      insertDescription(l);
    });
    faciesDescriptions.forEach(f => {
      insertDescription(f);
    });

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
