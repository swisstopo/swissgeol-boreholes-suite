import { Suspense, useContext, useState } from "react";
import { useTranslation } from "react-i18next";
import { Box, CircularProgress } from "@mui/material";
import { Options, optionsFromCapabilities } from "ol/source/WMTS";
import { useMapOverlays } from "../../api/useMapOverlays.ts";
import { AlertContext } from "../../components/alert/alertContext";
import { LayerConfig } from "../../components/map/map.ts";
import "../../components/map/mapProjections";
import { FullPageCentered } from "../../components/styledComponents.ts";
import { Layer, WmsCapabilities, WmtsCapabilities } from "./layerInterface.ts";
import { MapSettings, MapSettingsState } from "./mapSettings";

const defaultWms = "https://wms.geo.admin.ch?request=getCapabilities&service=WMS";

const wmsOptions = [
  {
    key: defaultWms,
    text: defaultWms,
    value: defaultWms,
  },
  {
    key: "https://wmts.geo.admin.ch/EPSG/2056/1.0.0/WMTSCapabilities.xml",
    text: "https://wmts.geo.admin.ch/EPSG/2056/1.0.0/WMTSCapabilities.xml",
    value: "https://wmts.geo.admin.ch/EPSG/2056/1.0.0/WMTSCapabilities.xml",
  },
];

const GeneralSettings = () => {
  const { showAlert } = useContext(AlertContext);
  const { i18n, t } = useTranslation();

  const { overlays, addOverlay, removeOverlay } = useMapOverlays();
  const [selectedWMS, setSelectedWMS] = useState(defaultWms);
  const [state, setState] = useState<MapSettingsState>({
    fields: false,
    identifiers: false,
    codeLists: false,
    searchFiltersBoreholes: false,
    searchFiltersLayers: false,
    map: false,

    wmtsFetch: false,
    searchWmts: "",
    searchWmtsUser: "",
    wmts: null,

    wmsFetch: false,
    searchWms: "",
    searchWmsUser: "",
    wms: null,
  });

  const dispatchMapSettings = (
    layer: Layer,
    type: "WMS" | "WMTS",
    url: string | undefined,
    conf: Options | null,
    position: number,
    queryable: boolean,
  ) => {
    const key = type === "WMTS" ? layer.Identifier : layer.Name;
    if (key === undefined) return;
    addOverlay(key, {
      Identifier: key,
      Abstract: layer.Abstract,
      position: position,
      Title: layer.Title,
      transparency: 0,
      type: type,
      url: url,
      visibility: true,
      queryable: queryable,
      conf: conf,
      // The overlay shape is built dynamically for both layer types; the discriminated
      // union cannot be narrowed from the runtime `type` value at the literal.
    } as LayerConfig);
  };

  const addExplorerMap = (
    layer: Layer,
    type: "WMS" | "WMTS",
    result: WmsCapabilities | WmtsCapabilities,
    position = 0,
  ) => {
    if (type === "WMS") {
      if (!layer.CRS?.includes("EPSG:2056")) {
        showAlert(t("onlyEPSG2056Supported"), "error");
      } else if ("Service" in result) {
        dispatchMapSettings(layer, type, result.Service.OnlineResource, null, position, layer.queryable ?? false);
      }
    } else if (type === "WMTS") {
      const conf: Options | null = optionsFromCapabilities(result, {
        layer: layer.Identifier,
      });
      if (conf) {
        if (Object.prototype.hasOwnProperty.call(conf, "matrixSet") && !conf.matrixSet.includes("2056")) {
          showAlert(t("onlyEPSG2056Supported"), "error");
        } else {
          dispatchMapSettings(layer, type, conf.urls?.[0], conf, position, false);
        }
      }
    }
  };

  const removeExplorerMap = (config: { Identifier?: string }) => {
    if (config.Identifier === undefined) return;
    removeOverlay(config.Identifier);
  };

  return (
    <Box>
      <Suspense
        fallback={
          <FullPageCentered>
            <CircularProgress />
          </FullPageCentered>
        }>
        <MapSettings
          overlays={overlays}
          i18n={i18n}
          removeExplorerMap={removeExplorerMap}
          addExplorerMap={addExplorerMap}
          selectedWMS={selectedWMS}
          wmsOptions={wmsOptions}
          handleOnChange={(value: string) => {
            setState({ ...state, wmsFetch: false, wms: null, wmts: null });
            setSelectedWMS(value);
          }}
          state={state}
          setState={setState}
        />
      </Suspense>
    </Box>
  );
};

export default GeneralSettings;
