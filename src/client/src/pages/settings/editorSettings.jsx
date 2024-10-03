import React, { useContext } from "react";
import { useTranslation } from "react-i18next";
import { useDispatch, useSelector } from "react-redux";
import { Button } from "@mui/material";
import { Divider } from "semantic-ui-react";
import _ from "lodash";
import { register } from "ol/proj/proj4";
import { optionsFromCapabilities } from "ol/source/WMTS";
import proj4 from "proj4";
import { patchCodeConfig, patchSettings } from "../../api-lib/index";
import { theme } from "../../AppTheme";
import { AlertContext } from "../../components/alert/alertContext";
import TranslationText from "../../components/legacyComponents/translationText.jsx";
import EditorSettingList from "./components/editorSettingList/editorSettingList";
import MapSettings from "./components/editorSettingList/mapSettings";
import { boreholeEditorData } from "./data/boreholeEditorData";
import { lithologyFieldEditorData } from "./data/lithologyFieldEditorData";
import { lithologyFilterEditorData } from "./data/lithologyFilterEditorData";
import { locationEditorData } from "./data/locationEditorData";
import { registrationEditorData } from "./data/registrationEditorData";

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

const EditorSettings = () => {
  const { showAlert } = useContext(AlertContext);
  const { i18n, t } = useTranslation();

  const setting = useSelector(state => state.setting);
  const codes = useSelector(state => state.core_domain_list);

  const dispatch = useDispatch();
  const toggleFieldArray = (filter, enabled) => {
    const newFilter = [];
    filter.forEach(element => {
      newFilter.push(`fields.${element}`);
    });
    dispatch(patchCodeConfig(newFilter, enabled));
  };

  const toggleFilterArray = (filter, enabled) => {
    const newFilter = [];
    filter.forEach(element => {
      newFilter.push(`efilter.${element}`);
    });
    dispatch(patchSettings(newFilter, enabled));
  };

  const toggleField = (filter, enabled) => {
    dispatch(patchCodeConfig(`fields.${filter}`, enabled));
  };
  const toggleFilter = (filter, enabled) => {
    dispatch(patchSettings(`efilter.${filter}`, enabled));
  };
  const addExplorerMap = (layer, type, result, position = 0) => {
    if (type === "WMS") {
      if (!layer.CRS.includes("EPSG:2056")) {
        showAlert("Only EPSG:2056 is supported", "error");
      } else {
        dispatch(
          patchSettings(
            "map.explorer",
            {
              Identifier: layer.Name,
              Abstract: layer.Abstract,
              position: position,
              Title: layer.Title,
              transparency: 0,
              type: "WMS",
              url: result.Service.OnlineResource,
              visibility: true,
              queryable: layer.queryable,
            },
            layer.Name,
          ),
        );
      }
    } else if (type === "WMTS") {
      const conf = optionsFromCapabilities(result, {
        layer: layer.Identifier,
      });
      if (Object.prototype.hasOwnProperty.call(conf, "matrixSet") && !conf.matrixSet.includes("2056")) {
        showAlert("Only EPSG:2056 is supported", "error");
      } else {
        dispatch(
          patchSettings(
            "map.explorer",
            {
              Identifier: layer.Identifier,
              Abstract: layer.Abstract,
              position: position,
              Title: layer.Title,
              transparency: 0,
              type: "WMTS",
              url: conf.urls,
              visibility: true,
              queryable: false,
              conf: {
                ...conf,
                projection: {
                  code: conf.projection.code_,
                  units: conf.projection.units_,
                  extent: conf.projection.extent_,
                  axisOrientation: conf.projection.axisOrientation_,
                  global: conf.projection.global_,
                  metersPerUnit: conf.projection.metersPerUnit_,
                  worldExtent: conf.projection.worldExtent_,
                },
                tileGrid: {
                  extent: conf.tileGrid.extent_,
                  origin: conf.tileGrid.origin_,
                  origins: conf.tileGrid.origins_,
                  resolutions: conf.tileGrid.resolutions_,
                  matrixIds: conf.tileGrid.matrixIds_,
                  tileSize: conf.tileGrid.tileSize_,
                  tileSizes: conf.tileGrid.tileSizes_,
                },
              },
            },
            layer.Identifier,
          ),
        );
      }
    }
  };

  const rmExplorerMap = config => {
    dispatch(patchSettings("map.explorer", null, config.Identifier));
  };

  const handleAddItem = value => {
    dispatch({
      type: "WMS_ADDED",
      url: value,
    });
  };
  const handleOnChange = value => {
    dispatch({
      type: "WMS_SELECTED",
      url: value,
    });
  };

  _.forEach(projections, function (proj, srs) {
    proj4.defs(srs, proj);
  });
  register(proj4);
  const [searchList, setSearchList] = React.useState([
    {
      id: 0,
      name: "location",
      translationId: "searchFilterLocation",
      isSelected: false,
    },
    {
      id: 1,
      name: "borehole",
      translationId: "searchFiltersBoreholes",
      isSelected: false,
    },

    {
      id: 2,
      name: "lithology",
      translationId: "searchFiltersLayers",
      isSelected: false,
    },
    {
      id: 3,
      name: "lithologyfields",
      translationId: "lithologyfields",
      isSelected: false,
    },
    {
      id: 4,
      name: "registration",
      translationId: "searchFilterRegistration",
      isSelected: false,
    },
  ]);
  const [state, setState] = React.useState({
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

  const handleButtonSelected = (name, isSelected) => {
    let selectedData;
    if (name === "location" && isSelected) {
      selectedData = locationEditorData;
    } else if (name === "borehole" && isSelected) {
      selectedData = boreholeEditorData;
    } else if (name === "lithology" && isSelected) {
      selectedData = lithologyFilterEditorData;
    } else if (name === "lithologyfields" && isSelected) {
      selectedData = lithologyFieldEditorData;
    } else if (name === "registration" && isSelected) {
      selectedData = registrationEditorData;
    } else {
      selectedData = null;
    }
    return selectedData;
  };

  return (
    <div
      style={{
        padding: "1em",
        flex: 1,
      }}>
      <MapSettings
        setting={setting}
        i18n={i18n}
        rmExplorerMap={rmExplorerMap}
        addExplorerMap={addExplorerMap}
        handleAddItem={value => {
          setState({ ...state, wmsFetch: false, wms: null, wmts: null });
          handleAddItem(value);
        }}
        handleOnChange={value => {
          setState({ ...state, wmsFetch: false, wms: null, wmts: null });
          handleOnChange(value);
        }}
        state={state}
        setState={setState}></MapSettings>

      {searchList?.map((filter, idx) => (
        <div key={idx}>
          <div
            onClick={() => {
              setSearchList(
                searchList.map(obj => (obj.id === idx ? { ...obj, isSelected: !obj.isSelected } : { ...obj })),
              );
            }}
            style={{
              flexDirection: "row",
              display: "flex",
              cursor: "pointer",
              backgroundColor: filter.isSelected
                ? theme.palette.background.lightgrey
                : theme.palette.background.default,
              padding: 10,
            }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                fontSize: 18,
                fontWeight: "bold",
              }}>
              <TranslationText id={filter.translationId} />
            </div>
            <div
              style={{
                flex: 1,
                textAlign: "right",
              }}>
              <Button variant="outlined">{filter.isSelected === true ? t("collapse") : t("expand")}</Button>
            </div>
          </div>
          {filter.isSelected === true && handleButtonSelected(filter.name, filter.isSelected) !== null ? (
            <EditorSettingList
              attribute={handleButtonSelected(filter.name, filter.isSelected)}
              codes={codes}
              data={setting.data.efilter}
              geocode={"Geol"}
              listName={filter.name}
              toggleField={toggleField}
              toggleFilter={toggleFilter}
              toggleFieldArray={toggleFieldArray}
              toggleFilterArray={toggleFilterArray}
              type={"editor"}
            />
          ) : (
            <Divider style={{ margin: 0 }} />
          )}
        </div>
      ))}
    </div>
  );
};

export default EditorSettings;
