import TileLayer from "ol/layer/Tile";
import WMTSTileGrid from "ol/tilegrid/WMTS";
import WMTS from "ol/source/WMTS";
import { Basemap } from "./Basemap";
import { ProjectionLike, get as getProjection } from "ol/proj";

const projection: ProjectionLike = getProjection("EPSG:2056") as ProjectionLike;

const resolutions: number[] = [
  4000, 3750, 3500, 3250, 3000, 2750, 2500, 2250, 2000, 1750, 1500, 1250, 1000, 750, 650, 500, 250, 100, 50, 20, 10, 5,
  2.5, 2, 1.5, 1, 0.5, 0.25, 0.1, 0.05, 0.025, 0.01,
];

const matrixIds: string[] = [];
for (let i = 0; i < resolutions.length; i++) {
  matrixIds.push(i.toString());
}

export const swissExtent: number[] = [2420000, 1030000, 2900000, 1350000];

const tileGrid: WMTSTileGrid = new WMTSTileGrid({
  origin: [swissExtent[0], swissExtent[3]],
  resolutions,
  matrixIds,
});

const createLayer = (layerInfo: { zIndex: number; layerName: string }) => {
  return new TileLayer({
    zIndex: layerInfo.zIndex,
    source: new WMTS({
      layer: layerInfo.layerName,
      url: "https://wmts.geo.admin.ch/1.0.0/{Layer}/default/current/2056/{TileMatrix}/{TileCol}/{TileRow}.jpeg",
      crossOrigin: "anonymous",
      attributions:
        '&copy; Data: <a style="color: black; text-decoration: underline;" href="https://www.swisstopo.admin.ch">swisstopo</a>',
      requestEncoding: "REST",
      style: "default",
      matrixSet: "2056",
      tileGrid,
      projection,
    }),
  });
};

const baseLayerNames = {
  satellite: "ch.swisstopo.swissimage",
  colormap: "ch.swisstopo.pixelkarte-farbe",
  greymap: "ch.swisstopo.pixelkarte-grau",
};

export const basemaps: Basemap[] = [
  {
    shortName: "colormap",
    previewImg: baseLayerNames.colormap,
    layer: createLayer({
      zIndex: 0,
      layerName: baseLayerNames.colormap,
    }),
  },
  {
    shortName: "satellite",
    previewImg: baseLayerNames.satellite,
    layer: createLayer({
      zIndex: 1,
      layerName: baseLayerNames.satellite,
    }),
  },

  {
    shortName: "greymap",
    previewImg: baseLayerNames.greymap,
    layer: createLayer({
      zIndex: 2,
      layerName: baseLayerNames.greymap,
    }),
  },
];
