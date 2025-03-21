import { useContext, useState } from "react";
import { useTranslation } from "react-i18next";
import { useDispatch, useSelector } from "react-redux";
import { Accordion, AccordionDetails, AccordionSummary, Box, Typography } from "@mui/material";
import { ChevronDownIcon } from "lucide-react";
import _ from "lodash";
import { register } from "ol/proj/proj4";
import { Options, optionsFromCapabilities } from "ol/source/WMTS";
import proj4 from "proj4";
import { patchCodeConfig, patchSettings } from "../../api-lib";
import { ReduxRootState } from "../../api-lib/ReduxStateInterfaces.ts";
import { useDomains } from "../../api/fetchApiV2";
import { theme } from "../../AppTheme";
import { AlertContext } from "../../components/alert/alertContext";
import GeneralSettingList from "./components/editorSettingList/generalSettingList.tsx";
import MapSettings from "./components/editorSettingList/mapSettings";
import { boreholeEditorData } from "./data/boreholeEditorData.ts";
import { lithologyFieldEditorData } from "./data/lithologyFieldEditorData.ts";
import { lithologyFilterEditorData } from "./data/lithologyFilterEditorData.ts";
import { locationEditorData } from "./data/locationEditorData.ts";
import { registrationEditorData } from "./data/registrationEditorData.ts";
import { SettingsItem } from "./data/SettingsItem.ts";
import { Layer } from "./layerInterface.ts";

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
  const { data: domains } = useDomains();

  const dispatch = useDispatch();
  const toggleFieldArray = (filter: string[], enabled: boolean) => {
    const newFilter: string[] = [];
    filter.forEach(element => {
      newFilter.push(`fields.${element}`);
    });
    dispatch(patchCodeConfig(newFilter, enabled));
  };

  const toggleFilterArray = (filter: string[], enabled: boolean) => {
    const newFilter: string[] = [];
    filter.forEach(element => {
      newFilter.push(`efilter.${element}`);
    });
    dispatch(patchSettings(newFilter, enabled));
  };

  const toggleField = (filter: string, enabled: boolean) => {
    dispatch(patchCodeConfig(`fields.${filter}`, enabled));
  };
  const toggleFilter = (filter: string, enabled: boolean) => {
    dispatch(patchSettings(`efilter.${filter}`, enabled));
  };

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

  const handleAddItem = (value: string) => {
    dispatch({
      type: "WMS_ADDED",
      url: value,
    });
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
  const [searchList, setSearchList] = useState([
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

  const handleButtonSelected = (name: string, isSelected: boolean): SettingsItem[] => {
    let selectedData: SettingsItem[];
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
      selectedData = [];
    }
    return selectedData;
  };

  function updateSearchList(idx: number) {
    setSearchList(searchList.map(obj => (obj.id === idx ? { ...obj, isSelected: !obj.isSelected } : { ...obj })));
  }

  return (
    <Box>
      <MapSettings
        setting={setting}
        i18n={i18n}
        rmExplorerMap={rmExplorerMap}
        addExplorerMap={addExplorerMap}
        handleAddItem={(value: string) => {
          setState({ ...state, wmsFetch: false, wms: null, wmts: null });
          handleAddItem(value);
        }}
        handleOnChange={(value: string) => {
          setState({ ...state, wmsFetch: false, wms: null, wmts: null });
          handleOnChange(value);
        }}
        state={state}
        setState={setState}></MapSettings>

      {searchList?.map((filter, idx) => (
        <Accordion key={filter.id} expanded={filter.isSelected} onChange={() => updateSearchList(idx)}>
          <AccordionSummary
            expandIcon={<ChevronDownIcon />}
            id={`panel${idx}-header`}
            sx={{
              flexDirection: "row",
              display: "flex",
              cursor: "pointer",
              backgroundColor: filter.isSelected
                ? theme.palette.background.lightgrey
                : theme.palette.background.default,
              padding: 2,
            }}>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
              }}>
              <Typography variant="body1">{t(filter.translationId)}</Typography>
            </Box>
          </AccordionSummary>
          <AccordionDetails>
            {filter.isSelected && handleButtonSelected(filter.name, filter.isSelected) !== null && (
              <GeneralSettingList
                settingsItems={handleButtonSelected(filter.name, filter.isSelected)}
                codes={domains}
                data={setting.data.efilter}
                listName={filter.name}
                toggleField={toggleField}
                toggleFilter={toggleFilter}
                toggleFieldArray={toggleFieldArray}
                toggleFilterArray={toggleFilterArray}
              />
            )}
          </AccordionDetails>
        </Accordion>
      ))}
    </Box>
  );
};

export default GeneralSettings;
