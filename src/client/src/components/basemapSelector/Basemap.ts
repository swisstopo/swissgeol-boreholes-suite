import LayerGroup from "ol/layer/Group";
import TileLayer from "ol/layer/Tile";
import XYZ from "ol/source/XYZ";

export interface Basemap {
  previewImg: string;
  shortName: string;
  layer: TileLayer<XYZ> | LayerGroup;
}
