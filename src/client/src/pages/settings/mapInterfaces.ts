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

export interface MapSettingsState {
  fields: boolean;
  identifiers: boolean;
  codeLists: boolean;
  searchFiltersBoreholes: boolean;
  searchFiltersLayers: boolean;
  map: boolean;
  wmtsFetch: boolean;
  searchWmts: string;
  searchWmtsUser: string;
  wmts: WmtsCapabilities | null;
  wmsFetch: boolean;
  searchWms: string;
  wms: WmsCapabilities | null;
}

export interface WmsOption {
  key: string;
  text: string;
  value: string;
}
