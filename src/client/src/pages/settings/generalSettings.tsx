import { Suspense, useContext, useState } from "react";
import { useTranslation } from "react-i18next";
import { useDispatch, useSelector } from "react-redux";
import { Box, CircularProgress } from "@mui/material";
import { Options, optionsFromCapabilities } from "ol/source/WMTS";
import { patchSettings } from "../../api-lib";
import { ReduxRootState } from "../../api-lib/ReduxStateInterfaces.ts";
import { AlertContext } from "../../components/alert/alertContext";
import "../../components/map/mapProjections";
import { FullPageCentered } from "../../components/styledComponents.ts";
import { Layer } from "./layerInterface.ts";
import { MapSettings } from "./mapSettings";

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
