import TileLayer from "ol/layer/Tile";
import WMTSTileGrid from "ol/tilegrid/WMTS";
import LayerGroup from "ol/layer/Group";
import WMTS from "ol/source/WMTS";
import { Basemap } from "./Basemap";
import { ProjectionLike, get as getProjection } from "ol/proj";

export const swissExtent: number[] = [2420000, 1030000, 2900000, 1350000];

const projection: ProjectionLike = getProjection("EPSG:2056") as ProjectionLike;
const resolutions: number[] = [
  4000, 3750, 3500, 3250, 3000, 2750, 2500, 2250, 2000, 1750, 1500, 1250, 1000, 750, 650, 500, 250, 100, 50, 20, 10, 5,
  2.5, 2, 1.5, 1, 0.5, 0.25, 0.1,
];

const matrixSet = "2056";
const requestEncoding = "REST";
const style = "default";
const crossOrigin = "anonymous";
const attributions: string =
  '&copy; Data: <a style="color: black; text-decoration: underline;" href="https://www.swisstopo.admin.ch">swisstopo</a>';
const wmtsBaseUrl =
  "https://wmts10.geo.admin.ch/1.0.0/{Layer}/default/current/2056/{TileMatrix}/{TileCol}/{TileRow}.jpeg";
const matrixIds: string[] = [];
for (let i = 0; i < resolutions.length; i++) {
  matrixIds.push(i.toString());
}

const tileGrid: WMTSTileGrid = new WMTSTileGrid({
  origin: [swissExtent[0], swissExtent[3]],
  resolutions,
  matrixIds,
});

const baseLayerNames = {
  colormap: "ch.swisstopo.pixelkarte-farbe",
  detailedColormap: "ch.swisstopo.swisstlm3d-karte-farbe",
  satellite: "ch.swisstopo.swissimage",
  greymap: "ch.swisstopo.pixelkarte-grau",
};

const createLayer = (layerName: string) => {
  return new TileLayer({
    minResolution: 0.1,
    source: new WMTS({
      layer: layerName,
      url: wmtsBaseUrl,
      crossOrigin,
      attributions,
      requestEncoding,
      style,
      matrixSet,
      tileGrid,
      projection,
    }),
  });
};

export const basemaps: Basemap[] = [
  {
    shortName: "colormap",
    previewImg: baseLayerNames.colormap,
    layer: new LayerGroup({
      layers: [
        new TileLayer({
          minResolution: 2.5,
          source: new WMTS({
            layer: baseLayerNames.colormap,
            url: wmtsBaseUrl,
            crossOrigin,
            attributions,
            tileGrid,
            projection,
            requestEncoding,
            style,
            matrixSet,
          }),
        }),
        new TileLayer({
          maxResolution: 2.5,
          source: new WMTS({
            layer: baseLayerNames.detailedColormap,
            url: "https://wmts10.geo.admin.ch/1.0.0/{Layer}/default/current/2056/{TileMatrix}/{TileCol}/{TileRow}.png",
            crossOrigin,
            attributions,
            tileGrid,
            projection,
            requestEncoding,
            style,
            matrixSet,
          }),
        }),
      ],
    }),
  },
  {
    shortName: "satellite",
    previewImg: baseLayerNames.satellite,
    layer: createLayer(baseLayerNames.satellite),
  },

  {
    shortName: "greymap",
    previewImg: baseLayerNames.greymap,
    layer: createLayer(baseLayerNames.greymap),
  },
];
