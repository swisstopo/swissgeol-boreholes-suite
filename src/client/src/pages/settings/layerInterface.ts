export interface Layer {
  Title?: string;
  Abstract?: string;
  Name?: string;
  Identifier?: string;
  queryable?: boolean;
  CRS?: string[];
}

/** Subset of the WMS GetCapabilities document parsed by OpenLayers that the UI reads. */
export interface WmsCapabilities {
  Service: { OnlineResource: string };
  Capability: { Layer: { Layer: Layer[] } };
}

/** Subset of the WMTS GetCapabilities document parsed by OpenLayers that the UI reads. */
export interface WmtsCapabilities {
  Contents: { Layer: Layer[] };
}
