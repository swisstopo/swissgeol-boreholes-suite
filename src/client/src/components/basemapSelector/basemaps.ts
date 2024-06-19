import TileLayer from "ol/layer/Tile";
import { Basemap } from "./Basemap";
import XYZ from "ol/source/XYZ";
import { Map } from "ol";

export const swissExtent: number[] = [2420000, 1030000, 2900000, 1350000];

const resolutions: number[] = [
  4000, 3750, 3500, 3250, 3000, 2750, 2500, 2250, 2000, 1750, 1500, 1250, 1000, 750, 650, 500, 250, 100, 50, 20, 10, 5,
  2.5, 2, 1.5, 1, 0.5, 0.25, 0.1,
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
      minResolution: 0.1,
      maxZoom: 27,
      source: new XYZ({
        url: `https://wmts100.geo.admin.ch/1.0.0/ch.swisstopo.pixelkarte-farbe/default/current/3857/{z}/{x}/{y}.jpeg`,
        crossOrigin,
        attributions,
      }),
    }),
  },
  {
    name: "ch.swisstopo.swissimage",
    layer: new TileLayer({
      minResolution: 0.1,
      maxZoom: 27,
      source: new XYZ({
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
      minResolution: 0.1,
      maxZoom: 27,
      source: new XYZ({
        url: `https://wmts100.geo.admin.ch/1.0.0/ch.swisstopo.pixelkarte-grau/default/current/3857/{z}/{x}/{y}.jpeg`,
        crossOrigin,
        attributions,
      }),
    }),
  },
];

export function updateBasemap(map: Map, contextBasemapName: string) {
  if (contextBasemapName === "nomap") {
    map.getLayers().item(0).setOpacity(0);
  } else {
    const newBasemap = basemaps.find(bm => bm.name === contextBasemapName);
    if (newBasemap !== undefined) {
      newBasemap.layer.setOpacity(1);
      map.getLayers().setAt(0, newBasemap.layer);
      map.getLayers().item(0).changed();
    }
  }
}
