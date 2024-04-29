import TileLayer from "ol/layer/Tile";
import WMTS from "ol/source/WMTS";

export interface Basemap {
  previewImg: string;
  shortName: string;
  layer: TileLayer<WMTS>;
}
