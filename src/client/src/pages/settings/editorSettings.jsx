import React from "react";
import { connect } from "react-redux";
import PropTypes from "prop-types";
import { withTranslation } from "react-i18next";
import _ from "lodash";
import { Divider } from "semantic-ui-react";
import { patchCodeConfig, patchSettings } from "../../api-lib/index";
import TranslationText from "../../components/legacyComponents/translationText.jsx";
import EditorSettingList from "./components/editorSettingList/editorSettingList";
import { optionsFromCapabilities } from "ol/source/WMTS";
import { register } from "ol/proj/proj4";
import proj4 from "proj4";
import { boreholeEditorData } from "./data/boreholeEditorData";
import { lithologyFilterEditorData } from "./data/lithologyFilterEditorData";
import { lithologyFieldEditorData } from "./data/lithologyFieldEditorData";
import MapSettings from "./components/editorSettingList/mapSettings";
import { locationEditorData } from "./data/locationEditorData";
import { registrationEditorData } from "./data/registrationEditorData";
import { theme } from "../../AppTheme";
import { Button } from "@mui/material";

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

class EditorSettings extends React.Component {
  constructor(props) {
    super(props);
    _.forEach(projections, function (proj, srs) {
      proj4.defs(srs, proj);
    });
    register(proj4);
    this.setStateBound = this.setState.bind(this);
    this.state = {
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
      searchList: [
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
      ],
    };
  }

  isVisible(field) {
    const { geocode, codes } = this.props;
    if (_.has(codes, "data.layer_kind") && _.isArray(codes.data.layer_kind)) {
      for (let idx = 0; idx < codes.data.layer_kind.length; idx++) {
        const element = codes.data.layer_kind[idx];
        if (element.code === geocode) {
          if (_.isObject(element.conf) && _.has(element.conf, `fields.${field}`)) {
            return element.conf.fields[field];
          } else {
            return false;
          }
        }
      }
    }
    return false;
  }

  handleButtonSelected(name, isSelected) {
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
  }

  render() {
    const {
      addExplorerMap,
      rmExplorerMap,
      setting,
      i18n,
      toggleFilter,
      toggleFieldArray,
      toggleFilterArray,
      toggleField,
      t,
    } = this.props;
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
            this.setState(
              {
                wmsFetch: false,
                wms: null,
                wmts: null,
              },
              () => {
                this.props.handleAddItem(value);
              },
            );
          }}
          handleOnChange={value => {
            this.setState(
              {
                wmsFetch: false,
                wms: null,
                wmts: null,
              },
              () => {
                this.props.handleOnChange(value);
              },
            );
          }}
          state={this.state}
          setState={this.setStateBound}></MapSettings>

        {this.state?.searchList?.map((filter, idx) => (
          <div key={idx}>
            <div
              onClick={() => {
                this.setState(prevState => ({
                  ...prevState,
                  // update an array of objects:
                  searchList: prevState.searchList.map(obj =>
                    obj.id === idx ? { ...obj, isSelected: !obj.isSelected } : { ...obj },
                  ),
                }));
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
            {filter.isSelected === true && this.handleButtonSelected(filter.name, filter.isSelected) !== null ? (
              <EditorSettingList
                attribute={this.handleButtonSelected(filter.name, filter.isSelected)}
                codes={this.props.codes}
                data={setting.data.efilter}
                geocode={this.props.geocode}
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
  }
}

EditorSettings.propTypes = {
  codes: PropTypes.object,
  geocode: PropTypes.string,
  setting: PropTypes.object,
  t: PropTypes.func,
  toggleField: PropTypes.func,
  toggleFieldArray: PropTypes.func,
  toggleFilter: PropTypes.func,
  toggleFilterArray: PropTypes.func,
};

EditorSettings.defaultProps = {
  geocode: "Geol",
};

const mapStateToProps = state => {
  return {
    setting: state.setting,
    codes: state.core_domain_list,
    user: state.core_user,
  };
};

const mapDispatchToProps = dispatch => {
  return {
    dispatch: dispatch,
    toggleFieldArray: (filter, enabled) => {
      const newFilter = [];
      filter.forEach(element => {
        newFilter.push(`fields.${element}`);
      });
      dispatch(patchCodeConfig(newFilter, enabled));
    },
    toggleFilterArray: (filter, enabled) => {
      const newFilter = [];
      filter.forEach(element => {
        newFilter.push(`efilter.${element}`);
      });
      dispatch(patchSettings(newFilter, enabled));
    },
    toggleField: (filter, enabled) => {
      dispatch(patchCodeConfig(`fields.${filter}`, enabled));
    },
    toggleFilter: (filter, enabled) => {
      dispatch(patchSettings(`efilter.${filter}`, enabled));
    },
    addExplorerMap: (layer, type, result, position = 0) => {
      if (type === "WMS") {
        if (!layer.CRS.includes("EPSG:2056")) {
          this.context.showAlert("Only EPSG:2056 is supported", "error");
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
          this.context.showAlert("Only EPSG:2056 is supported", "error");
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
    },
    rmExplorerMap: config => {
      dispatch(patchSettings("map.explorer", null, config.Identifier));
    },

    handleAddItem: value => {
      dispatch({
        type: "WMS_ADDED",
        url: value,
      });
    },
    handleOnChange: value => {
      dispatch({
        type: "WMS_SELECTED",
        url: value,
      });
    },
  };
};

const ConnectedEditorSettings = connect(mapStateToProps, mapDispatchToProps)(withTranslation("common")(EditorSettings));
export default ConnectedEditorSettings;
