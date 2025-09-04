// src/client/src/pages/detail/form/stratigraphy/stratigraphyV2/lithologyV2/useLithologyLayers.tsx
import { useMemo } from "react";
import { Lithology } from "../../lithology.ts";

export function useFilledLayers(lithologies: Lithology[] = []) {
  const filledLayers = useMemo(() => {
    const sortedLithologies = [...lithologies].sort((a, b) => a.fromDepth - b.fromDepth);
    const result: LithologyLayer[] = [];

    let lastDepth = 0;
    sortedLithologies.forEach((lithology, index) => {
      // If there's a gap between this layer and the previous depth, add a gap filler
      if (lithology.fromDepth > lastDepth && index > 0) {
        result.push({
          id: `gap-${index}`,
          fromDepth: lastDepth,
          toDepth: lithology.fromDepth,
          isGap: true,
        });
      }

      result.push(lithology);
      lastDepth = lithology.toDepth;
    });

    return result;
  }, [lithologies]);

  return { filledLayers };
}
