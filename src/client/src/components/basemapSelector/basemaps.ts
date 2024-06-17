import TileLayer from "ol/layer/Tile";
import LayerGroup from "ol/layer/Group";
import { Basemap } from "./Basemap";
import WMTS from "ol/source/WMTS";
import WMTSTileGrid from "ol/tilegrid/WMTS";
import XYZ from "ol/source/XYZ";
import { get as getProjection, ProjectionLike } from "ol/proj";
import { Map } from "ol";

export const swissExtent: number[] = [2420000, 1030000, 2900000, 1350000];

const projection: ProjectionLike = getProjection("EPSG:2056") as ProjectionLike;
const resolutions: number[] = [
  4000, 3750, 3500, 3250, 3000, 2750, 2500, 2250, 2000, 1750, 1500, 1250, 1000, 750, 650, 500, 250, 100, 50, 20, 10, 5,
  2.5, 2, 1.5, 1, 0.5, 0.25,
];

const matrixSet = "2056";
const requestEncoding = "REST";
const style = "default";
const crossOrigin = "anonymous";
const attributions: string =
  '&copy; Data: <a style="color: black; text-decoration: underline;" href="https://www.swisstopo.admin.ch">swisstopo</a>';
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
  detailedGreymap: "ch.swisstopo.swisstlm3d-karte-grau",
};

export const basemaps: Basemap[] = [
  {
    shortName: "colormap",
    previewImg: baseLayerNames.colormap,
    layer: new LayerGroup({
      layers: [
        new TileLayer({
          minResolution: 2.5,
          maxZoom: 27,
          source: new XYZ({
            url: `https://wmts100.geo.admin.ch/1.0.0/${baseLayerNames.colormap}/default/current/3857/{z}/{x}/{y}.jpeg`,
            crossOrigin,
            attributions,
          }),
        }),
        new TileLayer({
          maxResolution: 2.5,
          minResolution: 0.1,
          maxZoom: 27,
          source: new WMTS({
            layer: baseLayerNames.detailedColormap,
            url: "https://wmts100.geo.admin.ch/1.0.0/{Layer}/default/current/2056/{TileMatrix}/{TileCol}/{TileRow}.png",
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
    layer: new TileLayer({
      minResolution: 0.1,
      maxZoom: 27,
      source: new XYZ({
        cacheSize: 2048 * 3, // increase initial cache size, as seen in map.geo.admin
        url: `https://wmts100.geo.admin.ch/1.0.0/${baseLayerNames.satellite}/default/current/3857/{z}/{x}/{y}.jpeg`,
        crossOrigin,
        attributions,
      }),
    }),
  },

  {
    shortName: "greymap",
    previewImg: baseLayerNames.greymap,
    layer: new LayerGroup({
      layers: [
        new TileLayer({
          minResolution: 2.5,
          maxZoom: 27,
          source: new XYZ({
            url: `https://wmts100.geo.admin.ch/1.0.0/${baseLayerNames.greymap}/default/current/3857/{z}/{x}/{y}.jpeg`,
            crossOrigin,
            attributions,
          }),
        }),
        new TileLayer({
          maxResolution: 2.5,
          minResolution: 0.1,
          maxZoom: 27,
          source: new WMTS({
            layer: baseLayerNames.detailedGreymap,
            url: "https://wmts100.geo.admin.ch/1.0.0/{Layer}/default/current/2056/{TileMatrix}/{TileCol}/{TileRow}.png",
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
];

export function updateBasemap(map: Map, contextBasemapName: string) {
  if (contextBasemapName === "nomap") {
    map.getLayers().item(0).setOpacity(0);
  } else {
    const newBasemap = basemaps.find(bm => bm.shortName === contextBasemapName);
    if (newBasemap !== undefined) {
      newBasemap.layer.setOpacity(1);
      map.getLayers().setAt(0, newBasemap.layer);
      map.getLayers().item(0).changed();
    }
  }
}

export function getBasemap(contextBasemapName: string) {
  let basemap;
  if (contextBasemapName === "nomap") {
    basemap = basemaps[0].layer;
    basemap.setOpacity(0);
  } else {
    const foundBasemap = basemaps.find(bm => bm.shortName === contextBasemapName);
    if (foundBasemap !== undefined) {
      basemap = foundBasemap.layer;
    }
  }
  return basemap;
}
