import TileLayer from "ol/layer/Tile";
import LayerGroup from "ol/layer/Group";
import WMTS from "ol/source/WMTS";

export interface Basemap {
  previewImg: string;
  shortName: string;
  layer: LayerGroup | TileLayer<WMTS>;
}
