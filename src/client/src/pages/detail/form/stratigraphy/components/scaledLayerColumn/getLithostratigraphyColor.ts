import { LithostratigraphyLayer } from "../../../../../../api/generated";

interface LithostratigraphyConf {
  color?: [number, number, number];
}

const parseConf = (conf: string | null | undefined): LithostratigraphyConf | undefined => {
  if (!conf) return undefined;
  try {
    return JSON.parse(conf) as LithostratigraphyConf;
  } catch {
    return undefined;
  }
};

// Extract the rgb color encoded in the layer's lithostratigraphy codelist `conf` JSON,
// e.g. {"color":[165,210,185]}. Returns an "rgb(r,g,b)" string, or undefined if the conf
// is missing, malformed, or doesn't carry a valid 3-tuple color.
export const getLithostratigraphyColor = (layer: LithostratigraphyLayer): string | undefined => {
  const conf = parseConf(layer.lithostratigraphy?.conf);
  const color = conf?.color;
  if (!Array.isArray(color) || color.length !== 3) return undefined;
  return `rgb(${color[0]},${color[1]},${color[2]})`;
};
