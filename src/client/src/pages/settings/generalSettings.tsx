import { Suspense, useContext, useState } from "react";
import { useTranslation } from "react-i18next";
import { useDispatch, useSelector } from "react-redux";
import { Box, CircularProgress } from "@mui/material";
import _ from "lodash";
import { register } from "ol/proj/proj4";
import { Options, optionsFromCapabilities } from "ol/source/WMTS";
import proj4 from "proj4";
import { patchSettings } from "../../api-lib";
import { ReduxRootState } from "../../api-lib/ReduxStateInterfaces.ts";
import { AlertContext } from "../../components/alert/alertContext";
import { FullPageCentered } from "../../components/styledComponents.ts";
import { Layer } from "./layerInterface.ts";
import { MapSettings } from "./mapSettings";

const projections = {
  "EPSG:21781":
    "+proj=somerc +lat_0=46.95240555555556 +lon_0=7.439583333333333 +k_0=1 +x_0=600000 +y_0=200000 +ellps=bessel +towgs84=674.4,15.1,405.3,0,0,0,0 +units=m +no_defs",
  "EPSG:2056":
    "+proj=somerc +lat_0=46.95240555555556 +lon_0=7.439583333333333 +k_0=1 +x_0=2600000 +y_0=1200000 +ellps=bessel +towgs84=674.374,15.056,405.346,0,0,0,0 +units=m +no_defs",
  "EPSG:21782":
    "+proj=somerc +lat_0=46.95240555555556 +lon_0=7.439583333333333 +k_0=1 +x_0=0 +y_0=0 +ellps=bessel +towgs84=674.4,15.1,405.3,0,0,0,0 +units=m +no_defs",
  "EPSG:4149": "+proj=longlat +ellps=bessel +towgs84=674.4,15.1,405.3,0,0,0,0 +no_defs",
  "EPSG:4150": "+proj=longlat +ellps=bessel +towgs84=674.374,15.056,405.346,0,0,0,0 +no_defs",
};

const GeneralSettings = () => {
  const { showAlert } = useContext(AlertContext);
  const { i18n, t } = useTranslation();

  const setting = useSelector((state: ReduxRootState) => state.setting);
  const dispatch = useDispatch();
  const [state, setState] = useState({
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
    const key = type === "WMTS" ? layer?.Identifier : layer?.Name;
    dispatch(
      // @ts-expect-error legacy API methods will not be typed, as they are going to be removed
      patchSettings(
        "map.explorer",
        {
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
        },
        // @ts-expect-error typing not complete
        key,
      ),
    );
  };

  /* eslint-disable  @typescript-eslint/no-explicit-any */
  const addExplorerMap = (layer: Layer, type: "WMS" | "WMTS", result: any, position = 0) => {
    if (type === "WMS") {
      if (!layer.CRS.includes("EPSG:2056")) {
        showAlert(t("onlyEPSG2056Supported"), "error");
      } else {
        dispatchMapSettings(layer, type, result.Service.OnlineResource, null, position, layer.queryable);
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

  const rmExplorerMap = (config: Layer) => {
    // @ts-expect-error typing not complete
    dispatch(patchSettings("map.explorer", null, config.Identifier));
  };

  const handleOnChange = (value: string) => {
    dispatch({
      type: "WMS_SELECTED",
      url: value,
    });
  };

  _.forEach(projections, function (proj, srs) {
    proj4.defs(srs, proj);
  });
  register(proj4);

  return (
    <Box>
      <Suspense
        fallback={
          <FullPageCentered>
            <CircularProgress />
          </FullPageCentered>
        }>
        <MapSettings
          setting={setting}
          i18n={i18n}
          rmExplorerMap={rmExplorerMap}
          addExplorerMap={addExplorerMap}
          handleOnChange={(value: string) => {
            setState({ ...state, wmsFetch: false, wms: null, wmts: null });
            handleOnChange(value);
          }}
          state={state}
          setState={setState}
        />
      </Suspense>
    </Box>
  );
};

export default GeneralSettings;
