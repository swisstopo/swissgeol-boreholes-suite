import { Map } from "ol";
import TileLayer from "ol/layer/Tile";
import XYZ from "ol/source/XYZ";
import { Basemap } from "./Basemap";

export const swissExtent: number[] = [2420000, 1030000, 2900000, 1350000];

const resolutions: number[] = [
  4000, 3750, 3500, 3250, 3000, 2750, 2500, 2250, 2000, 1750, 1500, 1250, 1000, 750, 650, 500, 250, 100, 50, 20, 10, 5,
  2.5, 2, 1.5, 1, 0.5, 0.25,
];

export const crossOrigin = "anonymous";
export const attributions: string =
  '&copy; Data: <a style="color: black; text-decoration: underline;" href="https://www.swisstopo.admin.ch">swisstopo</a>';
const matrixIds: string[] = [];
for (let i = 0; i < resolutions.length; i++) {
  matrixIds.push(i.toString());
}

export const basemaps: Basemap[] = [
  {
    name: "ch.swisstopo.pixelkarte-farbe",
    layer: new TileLayer({
      properties: {
        name: "ch.swisstopo.pixelkarte-farbe",
      },
      source: new XYZ({
        maxZoom: 19,
        cacheSize: 2048 * 3, // increase initial cache size, as seen in map.geo.admin
        url: `https://wmts100.geo.admin.ch/1.0.0/ch.swisstopo.pixelkarte-farbe/default/current/3857/{z}/{x}/{y}.jpeg`,
        crossOrigin,
        attributions,
      }),
    }),
  },
  {
    name: "ch.swisstopo.swissimage",
    layer: new TileLayer({
      properties: {
        name: "ch.swisstopo.swissimage",
      },
      source: new XYZ({
        maxZoom: 20,
        cacheSize: 2048 * 3, // increase initial cache size, as seen in map.geo.admin
        url: `https://wmts100.geo.admin.ch/1.0.0/ch.swisstopo.swissimage/default/current/3857/{z}/{x}/{y}.jpeg`,
        crossOrigin,
        attributions,
      }),
    }),
  },
  {
    name: "ch.swisstopo.pixelkarte-grau",
    layer: new TileLayer({
      properties: {
        name: "ch.swisstopo.pixelkarte-grau",
      },
      source: new XYZ({
        maxZoom: 19,
        cacheSize: 2048 * 3, // increase initial cache size, as seen in map.geo.admin
        url: `https://wmts100.geo.admin.ch/1.0.0/ch.swisstopo.pixelkarte-grau/default/current/3857/{z}/{x}/{y}.jpeg`,
        crossOrigin,
        attributions,
      }),
    }),
  },
];

export function updateBasemap(map: Map, contextBasemapName: string) {
  const layers = map.getLayers();
  layers.forEach(function (layer) {
    const name = layer?.get("name");
    if (basemaps.map(b => b.name).includes(name)) {
      layers.remove(layer);
    }
  });

  if (contextBasemapName !== "nomap") {
    const newBasemap = basemaps.find(bm => bm.name === contextBasemapName);
    if (newBasemap !== undefined) {
      map.getLayers().insertAt(0, newBasemap.layer);
      map.getLayers().item(0).changed();
    }
  }
}
