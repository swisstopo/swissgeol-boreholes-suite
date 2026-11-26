import { Feature, Map } from "ol";
import { asArray } from "ol/color";
import { EventsKey } from "ol/events";
import VectorLayer from "ol/layer/Vector";
import { unByKey } from "ol/Observable";
import { getVectorContext } from "ol/render";
import RenderEvent from "ol/render/Event";
import VectorSource from "ol/source/Vector";
import { Circle, Stroke, Style } from "ol/style";
import { theme } from "../../AppTheme.ts";

const pulseDuration = 900;
const pulseCount = 2;
const ringGrowth = 16;
const ringWidth = 3;

// With reduced motion, a ring at a fixed size and opacity is shown instead of the pulse.
const reducedMotionDuration = 1000;
const reducedMotionProgress = 0.35;
const reducedMotionOpacity = 0.8;

export interface PulseLayer {
  layer: VectorLayer<VectorSource<Feature>, Feature>;
  // Radius of the ring around a feature before it grows, large enough to surround its symbol or badge.
  getRingRadius: (feature: Feature) => number;
}

const prefersReducedMotion = () => globalThis.matchMedia("(prefers-reduced-motion: reduce)").matches;

const createRingStyle = (radius: number, opacity: number) => {
  const [red, green, blue] = asArray(theme.palette.map.hover);
  return new Style({
    image: new Circle({ radius, stroke: new Stroke({ color: [red, green, blue, opacity], width: ringWidth }) }),
  });
};

/**
 * Lets a ring pulse twice around every feature visible in the given layers, to show where the boreholes and badges
 * are. Leaves the map unchanged afterwards. Returns a function that stops the pulse early.
 */
export const startHighlightPulse = (map: Map, pulseLayers: readonly PulseLayer[]): (() => void) => {
  const reducedMotion = prefersReducedMotion();
  const duration = reducedMotion ? reducedMotionDuration : pulseDuration * pulseCount;
  const startedAt = performance.now();
  let listenerKeys: EventsKey[] = [];

  const stop = () => {
    unByKey(listenerKeys);
    listenerKeys = [];
    map.render();
  };

  const drawRings = (event: RenderEvent, { layer, getRingRadius }: PulseLayer) => {
    const elapsed = performance.now() - startedAt;
    if (elapsed >= duration) {
      stop();
      return;
    }

    const progress = reducedMotion ? reducedMotionProgress : (elapsed % pulseDuration) / pulseDuration;
    const easedProgress = 1 - (1 - progress) ** 2;
    const opacity = reducedMotion ? reducedMotionOpacity : 0.9 * (1 - progress) ** 1.2;

    const vectorContext = getVectorContext(event);
    const visibleExtent = map.getView().calculateExtent(map.getSize());
    // One style per ring radius, shared by all features of that size in this frame.
    const ringStyles = new globalThis.Map<number, Style>();
    for (const feature of layer.getSource()?.getFeaturesInExtent(visibleExtent) ?? []) {
      const geometry = feature.getGeometry();
      if (!geometry) continue;
      const ringRadius = getRingRadius(feature);
      let ringStyle = ringStyles.get(ringRadius);
      if (!ringStyle) {
        ringStyle = createRingStyle(ringRadius + easedProgress * ringGrowth, opacity);
        ringStyles.set(ringRadius, ringStyle);
      }
      vectorContext.setStyle(ringStyle);
      vectorContext.drawGeometry(geometry);
    }
    map.render();
  };

  listenerKeys = pulseLayers.map(pulseLayer =>
    pulseLayer.layer.on("postrender", event => drawRings(event, pulseLayer)),
  );

  map.render();
  return stop;
};
