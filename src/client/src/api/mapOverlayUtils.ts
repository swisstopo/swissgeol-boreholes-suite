import type { LayerConfig } from "../components/map/map";

/**
 * Custom map overlays of the current user, keyed by layer identifier.
 */
export type MapOverlays = Record<string, LayerConfig>;

/**
 * Adds (or replaces) an overlay. The caller provides the position, mirroring the
 * legacy behavior where a newly added overlay is placed at the current layer count.
 */
export const addOverlay = (overlays: MapOverlays, identifier: string, layer: LayerConfig): MapOverlays => ({
  ...overlays,
  [identifier]: layer,
});

/**
 * Removes an overlay and compacts the positions of the remaining overlays: every
 * overlay positioned after the removed one moves up by one.
 */
export const removeOverlay = (overlays: MapOverlays, identifier: string): MapOverlays => {
  const removed = overlays[identifier];
  const next: MapOverlays = {};
  for (const [id, layer] of Object.entries(overlays)) {
    if (id === identifier) continue;
    next[id] = removed && layer.position > removed.position ? { ...layer, position: layer.position - 1 } : layer;
  }
  return next;
};

export const setOverlayVisibility = (overlays: MapOverlays, identifier: string, visibility: boolean): MapOverlays => ({
  ...overlays,
  [identifier]: { ...overlays[identifier], visibility },
});

export const setOverlayTransparency = (
  overlays: MapOverlays,
  identifier: string,
  transparency: number,
): MapOverlays => ({
  ...overlays,
  [identifier]: { ...overlays[identifier], transparency },
});

/**
 * Moves an overlay to a new position. The overlay currently occupying the target
 * position is swapped into the vacated slot, mirroring the legacy reorder behavior.
 */
export const setOverlayPosition = (overlays: MapOverlays, identifier: string, position: number): MapOverlays => {
  const current = overlays[identifier];
  if (!current) return overlays;

  const goingUp = current.position < position;
  const next: MapOverlays = {};
  for (const [id, layer] of Object.entries(overlays)) {
    next[id] =
      id !== identifier && layer.position === position
        ? { ...layer, position: layer.position + (goingUp ? -1 : 1) }
        : layer;
  }
  next[identifier] = { ...current, position };
  return next;
};
