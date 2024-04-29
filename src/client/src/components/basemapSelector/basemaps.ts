import TileLayer from "ol/layer/Tile";
import WMTSTileGrid from "ol/tilegrid/WMTS";
import LayerGroup from "ol/layer/Group";
import WMTS from "ol/source/WMTS";
import { Basemap } from "./Basemap";
import { ProjectionLike, get as getProjection } from "ol/proj";

const srs = "EPSG:2056";
const projection: ProjectionLike = getProjection(srs) as ProjectionLike;
const matrixSet = "2056";
const requestEncoding = "REST";
const style = "default";
const crossOrigin = "anonymous";
const attributions: string =
  '&copy; Data: <a style="color: black; text-decoration: underline;" href="https://www.swisstopo.admin.ch">swisstopo</a>';

const resolutions: number[] = [
  4000, 3750, 3500, 3250, 3000, 2750, 2500, 2250, 2000, 1750, 1500, 1250, 1000, 750, 650, 500, 250, 100, 50, 20, 10, 5,
  2.5, 2, 1.5, 1, 0.5, 0.25, 0.1, 0.05, 0.025, 0.01,
];
const extent: number[] = [2420000, 1030000, 2900000, 1350000];
const matrixIds: string[] = [];
for (let i = 0; i < resolutions.length; i++) {
  matrixIds.push(i.toString());
}
const tileGrid: WMTSTileGrid = new WMTSTileGrid({
  origin: [extent[0], extent[3]],
  resolutions,
  matrixIds,
});

export const basemaps: Basemap[] = [
  {
    shortName: "colormap",
    previewImg: "ch.swisstopo.pixelkarte-farbe",
    layer: ((): LayerGroup => {
      const layerGroup = new LayerGroup({
        zIndex: 0,
        layers: [
          new TileLayer({
            minResolution: 2.5,
            source: new WMTS({
              dimensions: {
                Time: "current",
              },
              layer: "ch.swisstopo.pixelkarte-farbe",
              url: "https://wmts10.geo.admin.ch/1.0.0/{Layer}/default/{Time}/2056/{TileMatrix}/{TileCol}/{TileRow}.jpeg",
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
              dimensions: {
                Time: "current",
              },
              layer: "ch.swisstopo.swisstlm3d-karte-farbe",
              url: "https://wmts10.geo.admin.ch/1.0.0/{Layer}/default/{Time}/2056/{TileMatrix}/{TileCol}/{TileRow}.png",
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
      });
      layerGroup.set("name", "colormap");
      return layerGroup;
    })() as LayerGroup,
  },
  {
    shortName: "satellite",
    previewImg: "ch.swisstopo.swissimage",
    layer: ((): TileLayer<WMTS> => {
      const tileLayer = new TileLayer({
        zIndex: 1,
        source: new WMTS({
          layer: "ch.swisstopo.swissimage",
          url: "https://wmts10.geo.admin.ch/1.0.0/{Layer}/default/current/2056/{TileMatrix}/{TileCol}/{TileRow}.jpeg",
          crossOrigin,
          attributions,
          tileGrid,
          projection,
          requestEncoding,
          style,
          matrixSet,
        }),
      });
      tileLayer.set("name", "swissimage");
      return tileLayer;
    })() as TileLayer<WMTS>,
  },
  {
    shortName: "greymap",
    previewImg: "ch.swisstopo.pixelkarte-grau",
    layer: ((): TileLayer<WMTS> => {
      const tileLayer = new TileLayer({
        zIndex: 2,
        source: new WMTS({
          layer: "ch.swisstopo.pixelkarte-grau",
          url: "https://wmts10.geo.admin.ch/1.0.0/{Layer}/default/current/2056/{TileMatrix}/{TileCol}/{TileRow}.jpeg",
          crossOrigin,
          attributions,
          tileGrid,
          projection,
          requestEncoding,
          style,
          matrixSet,
        }),
      });
      tileLayer.set("name", "greymap");
      return tileLayer;
    })(),
  },
];
