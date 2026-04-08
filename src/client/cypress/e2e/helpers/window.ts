import OlMap from "ol/Map";

export type mapDomId = "labeling-map" | "photo-map" | "extraction-map" | "pointOlMap" | "olMap";

export interface WindowWithMaps extends Window {
  "labeling-map"?: OlMap;
  "extraction-map"?: OlMap;
  "photo-map"?: OlMap;
  pointOlMap?: OlMap;
  olMap?: OlMap;
}
