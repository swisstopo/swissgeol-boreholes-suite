import { Map } from "ol";
import Feature from "ol/Feature";
import TileLayer from "ol/layer/Tile";
import VectorLayer from "ol/layer/Vector";
import { get as getProjection } from "ol/proj";
import TileWMS from "ol/source/TileWMS";
import VectorSource from "ol/source/Vector";
import WMTS from "ol/source/WMTS";
import WMTSTileGrid from "ol/tilegrid/WMTS";
import { swissExtent } from "../basemapSelector/basemaps";

interface WMTSLayerConfig {
  type: "WMTS";
  visibility: boolean;
  transparency: number;
  position: number;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  conf: any;
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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  layers: any;
  selected: (id: string | null) => void;
  setFeatureIds: (ids: number[]) => void;
  featureIds: number[];
  polygonSelectionEnabled: boolean;
  setPolygonSelectionEnabled: (enabled: boolean) => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  filterPolygon: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  setFilterPolygon: (polygon: any) => void;
  displayErrorMessage: (message: string) => void;
  mapResolution: number;
  mapCenter: [number, number] | null;
}

export const SRS = "EPSG:2056";

// ────────────────────── Helper functions ──────────────────────

export function addWMTSLayerToMap(map: Map, identifier: string, layer: WMTSLayerConfig, overlays: TileLayer[]) {
  const tileGridConfig = {
    ...layer.conf.tileGrid,
    origin: null,
    origins: layer.conf.tileGrid.origins_,
    resolutions: layer.conf.tileGrid.resolutions_ || [],
    matrixIds: layer.conf.tileGrid.matrixIds_ || [],
  };

  const wmtsLayer = new TileLayer({
    visible: layer.visibility,
    opacity: 1,
    source: new WMTS({
      ...layer.conf,
      extent: swissExtent,
      tileGrid: new WMTSTileGrid(tileGridConfig),
      projection: getProjection(SRS)!,
    }),
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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  filterPolygon: any,
): { filtered: Feature[]; ids: number[] } {
  if (filterPolygon === null) return { filtered: features, ids: [] };
  const polygonGeometry = filterPolygon.getGeometry();
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
