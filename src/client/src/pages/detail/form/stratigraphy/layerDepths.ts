interface DepthBearingLayer {
  // Accept null and undefined here so callers can pass both domain layers (Lithology, where these
  // are `number | null`) and generated API layers (Chrono/LithostratigraphyLayer, where these are
  // `number | null | undefined`). The `!= null` guard inside covers both.
  fromDepth?: number | null;
  toDepth?: number | null;
}

// Collects every layer's fromDepth and toDepth (skipping nulls), deduplicates the resulting
// set of values, and returns them sorted ascending. Used by both the lithology view and the
// chrono/litho-strat edit panels to feed the discrete depth scale.
export const collectLayerDepths = (layers: ReadonlyArray<DepthBearingLayer> | undefined): number[] => {
  if (!layers) return [];
  const set = new Set<number>();
  for (const l of layers) {
    if (l.fromDepth != null) set.add(l.fromDepth);
    if (l.toDepth != null) set.add(l.toDepth);
  }
  return [...set].sort((a, b) => a - b);
};
