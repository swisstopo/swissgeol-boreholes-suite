import { Dispatch, SetStateAction } from "react";
import { Map } from "ol";
import Feature from "ol/Feature";
import TileLayer from "ol/layer/Tile";
import VectorLayer from "ol/layer/Vector";
import { get as getProjection } from "ol/proj";
import TileWMS from "ol/source/TileWMS";
import VectorSource from "ol/source/Vector";
import WMTS, { Options as WMTSOptions } from "ol/source/WMTS";
import WMTSTileGrid from "ol/tilegrid/WMTS";
import { swissExtent } from "../basemapSelector/basemaps";

interface SerializedTileGrid {
  origins_?: number[][];
  resolutions_?: number[];
  matrixIds_?: string[];
}

type PersistedWMTSOptions = Omit<WMTSOptions, "tileGrid"> & {
  tileGrid: SerializedTileGrid;
};

interface WMTSLayerConfig {
  type: "WMTS";
  visibility: boolean;
  transparency: number;
  position: number;
  conf: PersistedWMTSOptions;
}

interface WMSLayerConfig {
  type: "WMS";
  visibility: boolean;
  transparency: number;
  position: number;
  url: string;
  Identifier: string;
}

export type LayerConfig = WMTSLayerConfig | WMSLayerConfig;

export interface MapComponentProps {
  geoJson: object | null;
  highlighted: number[];
  hover: (ids: number[]) => void;
  layers: Record<string, LayerConfig>;
  selected: (id: string | null) => void;
  setFeatureIds: (ids: number[]) => void;
  featureIds: number[];
  polygonSelectionEnabled: boolean;
  setPolygonSelectionEnabled: (enabled: boolean) => void;
  filterPolygon: Feature | null;
  setFilterPolygon: Dispatch<SetStateAction<Feature | null>>;
  displayErrorMessage: (message: string) => void;
  mapResolution: number;
  mapCenter: [number, number] | null;
}

export const SRS = "EPSG:2056";

// ────────────────────── Helper functions ──────────────────────

export function addWMTSLayerToMap(map: Map, identifier: string, layer: WMTSLayerConfig, overlays: TileLayer[]) {
  const tileGridConfig = {
    ...layer.conf.tileGrid,
    origin: undefined,
    origins: layer.conf.tileGrid.origins_,
    resolutions: layer.conf.tileGrid.resolutions_ ?? [],
    matrixIds: layer.conf.tileGrid.matrixIds_ ?? [],
  };

  const wmtsOptions: WMTSOptions = {
    ...layer.conf,
    tileGrid: new WMTSTileGrid(tileGridConfig),
    projection: getProjection(SRS)!,
  };

  const wmtsLayer = new TileLayer({
    visible: layer.visibility,
    opacity: 1,
    extent: swissExtent,
    source: new WMTS(wmtsOptions),
    zIndex: layer.position + 1,
  });
  wmtsLayer.set("name", identifier);
  overlays.push(wmtsLayer);
  map.addLayer(wmtsLayer);
}

export function addWMSLayerToMap(
  map: Map,
  identifier: string,
  layer: WMSLayerConfig,
  overlays: TileLayer[],
  extent: number[],
) {
  const wmsLayer = new TileLayer({
    visible: layer.visibility,
    opacity: 1 - layer.transparency / 100,
    extent: extent,
    source: new TileWMS({
      url: layer.url,
      params: {
        LAYERS: layer.Identifier,
        TILED: true,
        SRS: SRS,
        transition: 0,
      },
    }),
    zIndex: layer.position + 1,
  });
  wmsLayer.set("name", identifier);
  overlays.push(wmsLayer);
  map.addLayer(wmsLayer);
}

export function filterFeaturesByPolygon(
  features: Feature[],
  filterPolygon: Feature | null,
): { filtered: Feature[]; ids: number[] } {
  if (filterPolygon === null) return { filtered: features, ids: [] };
  const polygonGeometry = filterPolygon.getGeometry()!;
  const filtered = features.filter((feature: Feature) =>
    polygonGeometry.intersectsExtent(feature.getGeometry()!.getExtent()),
  );
  const ids = filtered.map((f: Feature) => f.get("id") as number);
  return { filtered, ids };
}

export function getDrawSource(map: Map): VectorSource | null {
  const drawLayer = map
    .getLayers()
    .getArray()
    .find(l => l.get("name") === "draw");
  return drawLayer ? (drawLayer as VectorLayer<VectorSource>).getSource() : null;
}
