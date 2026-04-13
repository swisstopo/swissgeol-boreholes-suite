import OlMap from "ol/Map";

export type MapDomId = "labeling-map" | "photo-map" | "extraction-map" | "pointOlMap" | "olMap";

export type WindowWithMaps = Window & { [Key in MapDomId]?: OlMap };
